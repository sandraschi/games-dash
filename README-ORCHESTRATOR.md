# AI Email Management Orchestrator

**Composites `email-mcp` + `local-llm-mcp` for intelligent email processing**

This orchestrator combines email access capabilities with AI analysis to create powerful email management tools like "weed_trash" - AI-powered email filtering and cleanup.

## 🚀 Quick Start

### Prerequisites

1. **Email MCP Setup**: Configure email credentials
   ```bash
   # For Gmail
   export SMTP_SERVER=smtp.gmail.com
   export SMTP_PORT=587
   export SMTP_USER=your-email@gmail.com
   export SMTP_PASSWORD=your-app-password

   # For Gmail IMAP
   export IMAP_SERVER=imap.gmail.com
   export IMAP_PORT=993
   export IMAP_USER=your-email@gmail.com
   export IMAP_PASSWORD=your-app-password
   ```

2. **Local LLM MCP Setup**: Configure AI provider
   ```bash
   # For Ollama (recommended)
   ollama serve  # Start Ollama server
   ollama pull llama3  # Download model

   # Or configure other providers
   export OPENAI_API_KEY=your-key
   export ANTHROPIC_API_KEY=your-key
   ```

### Installation

```bash
cd /d/D:/Dev/repos/email-mcp
pip install fastmcp  # If not already installed
```

### Run the Orchestrator

```bash
python email-llm-orchestrator.py
```

## 🛠️ Available Tools

### AI Email Management Tools

#### `weed_trash`
**AI-powered email cleanup** - Analyzes emails and suggests deletions based on intelligent criteria.

```python
# Safe analysis (recommended first)
result = await weed_trash(
    email_folder="INBOX",
    criteria="spam,promotions,old",
    dry_run=True,  # No emails deleted
    limit=50
)

# Actual cleanup
result = await weed_trash(
    email_folder="INBOX",
    criteria="spam,promotions",
    dry_run=False,  # Actually delete emails
    limit=20
)
```

**What it does:**
- Retrieves emails from your inbox
- Uses AI to analyze each email's content, subject, sender
- Determines if email should be deleted based on criteria
- Provides confidence scores and reasoning
- Optionally executes deletions

#### `email_summarizer`
**Intelligent email summaries** - Groups and summarizes emails by topic, sender, and importance.

```python
result = await email_summarizer(
    email_folder="INBOX",
    limit=50,
    summary_type="topics"  # or "brief", "detailed"
)
```

**What it does:**
- Analyzes recent emails
- Groups by sender, topic, urgency
- Provides AI-generated summaries
- Helps you quickly understand inbox contents

#### `smart_email_filter`
**AI-generated filtering rules** - Creates intelligent email filters based on patterns.

```python
result = await smart_email_filter(
    email_folder="INBOX",
    rules="custom rules here",
    auto_apply=False  # Manual review recommended
)
```

### Email Tools (from email-mcp)

All standard email operations with `email_` prefix:
- `email_send_email` - Send emails via SMTP/API/webhook
- `email_check_inbox` - Check inbox via IMAP/API
- `email_email_status` - Service connectivity status
- `email_configure_service` - Dynamic service configuration
- `email_list_services` - Available services

### LLM Tools (from local-llm-mcp)

All AI capabilities with `llm_` prefix:
- `llm_llm_generation` - Text generation and chat
- `llm_llm_models` - Model management
- `llm_llm_health` - System status
- `llm_llm_multimodal` - Image/audio processing

## 🎯 Use Cases

### 1. Intelligent Spam Filtering
```python
# AI learns what you consider spam
await weed_trash(criteria="spam,promotions,notifications", dry_run=True)
# Review suggestions, then run with dry_run=False
```

### 2. Inbox Zero Assistant
```python
# Get overview of recent emails
summary = await email_summarizer(limit=100, summary_type="topics")

# Clean up based on summary insights
await weed_trash(criteria="read,old,unimportant")
```

### 3. Smart Organization
```python
# Create filters for different email types
filters = await smart_email_filter()

# Move emails to appropriate folders
# (Future: automated organization)
```

### 4. Email Analysis
```python
# Who emails you most?
summary = await email_summarizer(summary_type="senders")

# What's trending in your inbox?
trends = await email_summarizer(limit=200, summary_type="topics")
```

## 🔧 Configuration

### Email Services

The orchestrator auto-detects email services from environment variables:

```bash
# SMTP (required for sending)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# IMAP (required for inbox access)
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password

# API Services (optional)
SENDGRID_API_KEY=your-key
MAILGUN_API_KEY=your-key
RESEND_API_KEY=your-key

# Webhook Services (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### LLM Providers

Configure your preferred AI provider:

```bash
# Ollama (recommended - local, private)
export LLM_MCP_DEFAULT_PROVIDER=ollama
export LLM_MCP_OLLAMA_BASE_URL=http://localhost:11434

# OpenAI (cloud)
export OPENAI_API_KEY=your-key
export LLM_MCP_DEFAULT_PROVIDER=openai

# Anthropic Claude
export ANTHROPIC_API_KEY=your-key
export LLM_MCP_DEFAULT_PROVIDER=anthropic
```

## 🛡️ Safety & Best Practices

### Always Start with `dry_run=True`
```python
# Safe: just shows suggestions
await weed_trash(dry_run=True)
```

### Use Specific Criteria
```python
# Good: targeted criteria
await weed_trash(criteria="spam,promotions")

# Avoid: too broad
await weed_trash(criteria="anything")
```

### Review AI Suggestions
- AI analysis isn't perfect
- Always review suggestions before applying
- Start with small batches (`limit=10`)

### Backup Important Emails
- Consider backing up important folders before bulk operations
- Use email provider's archive features

## 🏗️ Architecture

This orchestrator uses **FastMCP Server Composition**:

```
┌─────────────────┐    ┌──────────────────┐
│   MCP Client    │◄──►│   Orchestrator   │
│ (Claude/Cursor) │    │  (Composited)   │
└─────────────────┘    └─────────┬────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │  email-mcp   │ │ local-llm-  │ │ AI Email   │
        │  (SMTP/IMAP) │ │    mcp      │ │  Tools     │
        │              │ │  (AI/LLM)   │ │            │
        └──────────────┘ └─────────────┘ └────────────┘
```

### Benefits of Compositing

1. **Separation of Concerns**: Email access vs AI analysis
2. **Reusability**: Each MCP server can be used independently
3. **Extensibility**: Easy to add new AI email tools
4. **Safety**: AI decisions can be reviewed before execution

## 🔍 Troubleshooting

### Import Errors
```bash
# Check paths
python -c "from email_mcp.server import app; print('OK')"
python -c "from llm_mcp.main import app; print('OK')"
```

### Email Connection Issues
```bash
# Test email connectivity
python -c "
from email_mcp.tools.services import SMTPEmailService
config = {...}  # Your config
service = SMTPEmailService(config)
result = await service.test_connection()
print(result)
"
```

### LLM Issues
```bash
# Check LLM status
python -c "
import sys
sys.path.append('../local-llm-mcp/src')
from llm_mcp.main import app
# Check if models are available
"
```

## 🚀 Advanced Usage

### Custom AI Criteria
```python
# Use natural language for complex criteria
await weed_trash(
    criteria="""
    Delete if:
    - Older than 6 months AND not from important contacts
    - Newsletters I haven't opened in 3+ issues
    - Automated notifications that aren't urgent
    - Marketing emails from companies I don't recognize
    """
)
```

### Batch Processing
```python
# Process different folders
folders = ["INBOX", "Spam", "Archive"]
for folder in folders:
    result = await weed_trash(
        email_folder=folder,
        criteria="spam,old",
        limit=100
    )
    print(f"{folder}: {result['summary']}")
```

### Integration with Claude/Cursor

Use the orchestrator with AI assistants:

```
User: "Clean up my email inbox"
Assistant: Uses weed_trash with dry_run=True first, shows suggestions
User: "Looks good, proceed"
Assistant: Runs weed_trash with dry_run=False
```

## 📊 Performance

- **Email Retrieval**: Fast (depends on email provider)
- **AI Analysis**: ~2-5 seconds per email (local LLM)
- **Batch Processing**: Scales linearly with email count
- **Memory Usage**: ~200MB base + LLM model size

## 🤝 Contributing

1. Test with `dry_run=True` always
2. Add safety checks for destructive operations
3. Document new AI email tools clearly
4. Follow FastMCP patterns for consistency

## 📄 License

MIT License - see project LICENSE files.

---

**Created by compositing `email-mcp` + `local-llm-mcp` for AI-powered email management** 🚀