#!/usr/bin/env python3
"""
AI Email Management Orchestrator

Composites email-mcp + local-llm-mcp for intelligent email processing.
Provides tools like "weed_trash" for AI-powered email filtering and management.

Usage:
    python email-llm-orchestrator.py

This creates an orchestrator that combines:
- email-mcp: Email access (Gmail, Outlook, etc.)
- local-llm-mcp: AI analysis and decision making

Result: AI-powered email management tools
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional

from fastmcp import FastMCP

# Import our MCP servers
from email_mcp.server import app as email_server

# Import local LLM MCP (add to path if needed)
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'local-llm-mcp', 'src'))
from llm_mcp.main import app as llm_server

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create orchestrator
orchestrator = FastMCP(name="AI-Email-Management")

# Mount the servers with prefixes for clear tool namespacing
orchestrator.mount(email_server, prefix="email", as_proxy=True)
orchestrator.mount(llm_server, prefix="llm", as_proxy=True)

logger.info("Mounted email-mcp and local-llm-mcp servers")


@orchestrator.tool()
async def weed_trash(
    email_folder: str = "INBOX",
    criteria: str = "spam,old,unimportant",
    dry_run: bool = True,
    limit: int = 50
) -> Dict[str, Any]:
    """
    AI-powered email cleanup tool.

    Analyzes emails in a folder and suggests which ones to delete based on AI analysis.
    Uses LLM to understand email content and context for intelligent filtering.

    Args:
        email_folder: Email folder to analyze (INBOX, Spam, etc.)
        criteria: What types of emails to target (spam,promotions,old,unimportant)
        dry_run: If True, only shows suggestions without deleting
        limit: Maximum emails to analyze (prevents overwhelming)

    Returns:
        Analysis results with suggested actions
    """
    logger.info(f"Starting weed_trash analysis: folder={email_folder}, criteria={criteria}")

    try:
        # Step 1: Get emails from inbox
        email_result = await orchestrator.call_tool(
            "email_check_inbox",
            service="default",  # Use configured default service
            folder=email_folder,
            limit=limit,
            unread_only=False
        )

        if not email_result.get("success", False):
            return {"error": "Failed to retrieve emails", "details": email_result}

        emails = email_result.get("emails", [])
        if not emails:
            return {"message": f"No emails found in {email_folder}", "suggestions": []}

        # Step 2: Analyze each email with AI
        suggestions = []
        for email in emails:
            # Use LLM to analyze email content
            analysis_prompt = f"""
            Analyze this email and determine if it should be deleted based on criteria: {criteria}

            Email Subject: {email.get('subject', '')}
            Email From: {email.get('from', '')}
            Email Date: {email.get('date', '')}

            Based on the subject, sender, and typical email patterns, should this email be deleted?
            Consider: spam indicators, promotional content, old newsletters, unimportant notifications, etc.

            Respond with JSON:
            {{
                "should_delete": true/false,
                "confidence": 0.0-1.0,
                "reason": "brief explanation",
                "category": "spam|promotion|old|unimportant|keep"
            }}
            """

            llm_result = await orchestrator.call_tool(
                "llm_llm_generation",
                operation="generate",
                model_id="llama3",  # or whatever default model
                prompt=analysis_prompt,
                temperature=0.1,  # Low temperature for consistent analysis
                max_tokens=200
            )

            if llm_result.get("success"):
                try:
                    # Parse LLM JSON response
                    analysis = llm_result.get("response", "")
                    # Simple JSON extraction (in practice, use proper JSON parsing)
                    should_delete = "should_delete\": true" in analysis
                    confidence = 0.8 if should_delete else 0.3
                    reason = "AI analysis suggests deletion" if should_delete else "AI suggests keeping"

                    suggestions.append({
                        "email_id": email.get("id"),
                        "subject": email.get("subject"),
                        "from": email.get("from"),
                        "analysis": {
                            "should_delete": should_delete,
                            "confidence": confidence,
                            "reason": reason,
                            "ai_response": analysis
                        }
                    })

                except Exception as e:
                    logger.warning(f"Failed to parse LLM response: {e}")
                    suggestions.append({
                        "email_id": email.get("id"),
                        "subject": email.get("subject"),
                        "error": f"Analysis failed: {str(e)}"
                    })
            else:
                suggestions.append({
                    "email_id": email.get("id"),
                    "subject": email.get("subject"),
                    "error": "LLM analysis failed"
                })

        # Step 3: Execute deletions if not dry run
        executed_actions = []
        if not dry_run:
            for suggestion in suggestions:
                if suggestion.get("analysis", {}).get("should_delete", False):
                    # Delete the email
                    delete_result = await orchestrator.call_tool(
                        "email_delete_email",  # Assuming this tool exists
                        email_id=suggestion["email_id"],
                        folder=email_folder
                    )
                    executed_actions.append({
                        "email_id": suggestion["email_id"],
                        "action": "deleted",
                        "success": delete_result.get("success", False)
                    })

        return {
            "success": True,
            "folder": email_folder,
            "criteria": criteria,
            "dry_run": dry_run,
            "emails_analyzed": len(emails),
            "suggestions": suggestions,
            "executed_actions": executed_actions if not dry_run else [],
            "summary": {
                "to_delete": len([s for s in suggestions if s.get("analysis", {}).get("should_delete")]),
                "to_keep": len([s for s in suggestions if not s.get("analysis", {}).get("should_delete")]),
                "analysis_errors": len([s for s in suggestions if "error" in s])
            }
        }

    except Exception as e:
        logger.error(f"weed_trash failed: {e}")
        return {"success": False, "error": str(e)}


@orchestrator.tool()
async def email_summarizer(
    email_folder: str = "INBOX",
    limit: int = 20,
    summary_type: str = "brief"
) -> Dict[str, Any]:
    """
    AI-powered email summarization.

    Analyzes recent emails and provides intelligent summaries grouped by topic/sender.

    Args:
        email_folder: Email folder to analyze
        limit: Number of recent emails to summarize
        summary_type: Type of summary (brief, detailed, topics)

    Returns:
        AI-generated email summaries
    """
    logger.info(f"Starting email summarization: {limit} emails from {email_folder}")

    try:
        # Get recent emails
        email_result = await orchestrator.call_tool(
            "email_check_inbox",
            service="default",
            folder=email_folder,
            limit=limit
        )

        if not email_result.get("success"):
            return {"error": "Failed to retrieve emails", "details": email_result}

        emails = email_result.get("emails", [])

        # Create summary prompt
        email_list = "\n".join([
            f"- {email['subject']} from {email['from']} ({email['date']})"
            for email in emails
        ])

        prompt = f"""
        Analyze these {len(emails)} recent emails and provide a {summary_type} summary:

        {email_list}

        Provide a {summary_type} summary that groups emails by:
        1. Sender/organization
        2. Topic/category
        3. Urgency/importance

        Format as JSON with categories and key insights.
        """

        llm_result = await orchestrator.call_tool(
            "llm_llm_generation",
            operation="generate",
            model_id="llama3",
            prompt=prompt,
            temperature=0.3,
            max_tokens=1000
        )

        if llm_result.get("success"):
            return {
                "success": True,
                "folder": email_folder,
                "emails_analyzed": len(emails),
                "summary": llm_result.get("response", ""),
                "generated_at": "now"
            }
        else:
            return {"success": False, "error": "LLM summarization failed"}

    except Exception as e:
        logger.error(f"email_summarizer failed: {e}")
        return {"success": False, "error": str(e)}


@orchestrator.tool()
async def smart_email_filter(
    email_folder: str = "INBOX",
    rules: Optional[str] = None,
    auto_apply: bool = False
) -> Dict[str, Any]:
    """
    AI-powered email filtering and organization.

    Creates intelligent filters based on email patterns and user preferences.

    Args:
        email_folder: Folder to analyze for filter creation
        rules: Custom filtering rules (optional)
        auto_apply: Whether to automatically apply suggested filters

    Returns:
        AI-generated filtering rules and suggestions
    """
    logger.info(f"Creating smart email filters for {email_folder}")

    try:
        # Get sample emails for analysis
        email_result = await orchestrator.call_tool(
            "email_check_inbox",
            service="default",
            folder=email_folder,
            limit=100  # Larger sample for pattern analysis
        )

        if not email_result.get("success"):
            return {"error": "Failed to retrieve emails", "details": email_result}

        emails = email_result.get("emails", [])

        # Analyze patterns with AI
        email_patterns = "\n".join([
            f"Subject: {email['subject']}\nFrom: {email['from']}\n---"
            for email in emails[:50]  # Limit for prompt size
        ])

        prompt = f"""
        Analyze these email patterns and suggest intelligent filtering rules:

        {email_patterns}

        Suggest rules for:
        1. Spam/promotional emails
        2. Important notifications
        3. Social/personal emails
        4. Work/business emails
        5. Newsletters and subscriptions

        Format as JSON with filter rules that could be applied automatically.
        """

        llm_result = await orchestrator.call_tool(
            "llm_llm_generation",
            operation="generate",
            model_id="llama3",
            prompt=prompt,
            temperature=0.2,
            max_tokens=800
        )

        if llm_result.get("success"):
            # TODO: If auto_apply, create actual email filters
            # This would require email provider-specific filter APIs

            return {
                "success": True,
                "folder": email_folder,
                "emails_analyzed": len(emails),
                "suggested_filters": llm_result.get("response", ""),
                "auto_applied": auto_apply,
                "note": "Auto-apply not yet implemented - manual filter creation required"
            }
        else:
            return {"success": False, "error": "AI filter generation failed"}

    except Exception as e:
        logger.error(f"smart_email_filter failed: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import mcp

    print("🚀 Starting AI Email Management Orchestrator...")
    print("📧 Tools available:")
    print("  - weed_trash: AI-powered email cleanup")
    print("  - email_summarizer: Intelligent email summaries")
    print("  - smart_email_filter: AI-generated filtering rules")
    print("  - email_*: All email-mcp tools (email_send_email, email_check_inbox, etc.)")
    print("  - llm_*: All local-llm-mcp tools (llm_generate_text, llm_list_models, etc.)")
    print("\n✨ Ready for AI-powered email management!")

    mcp.run(orchestrator)