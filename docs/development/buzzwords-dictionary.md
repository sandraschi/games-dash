# 📚 Buzzwords Dictionary: Essential Developer Terminology

**Essential developer terminology guide for navigating the games collection codebase and documentation.**

---

## 🎯 **AI & Development Terminology**

### **LDDO - Low Entropic Density Derivative Output Prevention**
**Definition**: Quality assurance framework for preventing low-quality AI outputs
- **Highbrow Equivalent**: The fancy academic/technical term for "slop prevention"
- **Lowbrow Equivalent**: Preventing AI from generating derivative, low-information crap
- **Mathematical Basis**: Measures information entropy per unit output
- **Context**: Used in quality assessment of AI-generated code and content
- **Related**: [Entropy in Information Theory](entropy-information-theory.md), [LDDO in HOW_THIS_IS_BUILT](HOW_THIS_IS_BUILT.md#slop-avoidance-strategies-lDDO)

**Example Usage:**
```javascript
// High entropy (good) - novel, complex solution
const optimalSolution = data.reduce((acc, item) => {
  const transformed = item.value * Math.sin(item.angle);
  return acc + transformed / (1 + Math.exp(-item.confidence));
}, 0);

// Low entropy (bad) - repetitive, derivative code
const result = 0;
for (let i = 0; i < data.length; i++) {
  result = result + data[i];
}
```

### **Slop**
**Definition**: Low-quality, derivative AI outputs that appear coherent but lack real value
- **Highbrow Equivalent**: Low entropic density derivative output
- **Lowbrow Equivalent**: AI-generated garbage that sounds smart but isn't
- **Detection**: Repetitive phrases, generic boilerplate, missing edge cases
- **Context**: What LDDO prevents in AI-assisted development
- **Related**: LDDO, entropy, AI quality assessment, [LDDO in HOW_THIS_IS_BUILT](HOW_THIS_IS_BUILT.md#slop-avoidance-strategies-lDDO)

**Slop Examples:**
- ❌ "The best solution is the best solution that works best"
- ❌ "This is a very important feature that adds value"
- ❌ Repetitive explanations without new insights

### **FlowEngineering**
**Definition**: Advanced human-AI collaborative development methodology
- **Highbrow Equivalent**: Human-AI symbiosis in software development
- **Lowbrow Equivalent**: Getting AI to do the grunt work while humans do the thinking
- **Components**: Strategic planning + AI execution + quality control
- **Results**: 20x faster development with enterprise quality
- **Context**: The methodology used to build this 75-game collection

### **Agentic IDE**
**Definition**: AI-powered development environment with integrated AI assistance
- **Examples**: Cursor IDE, GitHub Copilot Workspace
- **Features**: Real-time code completion, context-aware suggestions, automated testing
- **Benefits**: 3-5x productivity increase, reduced cognitive load
- **Context**: Essential tool for modern AI-assisted development

---

## 🛠️ **Technical Terminology**

### **Portmanteau Tools**
**Definition**: Consolidated tool interfaces that combine multiple related operations
- **Highbrow Equivalent**: Unified API design pattern for complex operations
- **Lowbrow Equivalent**: "One tool to rule them all" for related functions
- **Benefits**: Reduced tool explosion, better discoverability, consistent interfaces
- **Examples**: `user-advanced-memory-mcp-adn_content` (write, read, edit, etc.)

### **MCP - Model Context Protocol**
**Definition**: Standard for connecting AI assistants to external tools and data sources
- **Highbrow Equivalent**: Interoperability framework for AI agent ecosystems
- **Lowbrow Equivalent**: Way to make AI assistants actually useful by giving them tools
- **Components**: Servers (provide tools), Clients (use tools), Transport layer
- **Benefits**: Extensible AI capabilities, standardized tool interfaces

### **FastMCP**
**Definition**: High-performance MCP server framework
- **Highbrow Equivalent**: Optimized asynchronous MCP implementation
- **Lowbrow Equivalent**: The "fast" version of MCP that actually works well
- **Features**: Async support, streaming responses, efficient resource usage
- **Version**: Target FastMCP 2.13+ for all servers

---

## 🎮 **Gaming & AI Terminology**

### **ELO Rating**
**Definition**: Chess skill rating system (higher = better player)
- **Highbrow Equivalent**: Bradley-Terry model for paired comparison ranking
- **Lowbrow Equivalent**: Chess skill points (like XP in video games)
- **Scale**: 1000-2900 range, increases with wins vs stronger opponents
- **Context**: Stockfish is rated ~3500 ELO, grandmasters ~2500-2800

### **Minimax Algorithm**
**Definition**: Game theory algorithm for finding optimal moves
- **Highbrow Equivalent**: Zero-sum game decision-making with adversarial search
- **Lowbrow Equivalent**: "Look ahead and pick the best move"
- **Components**: Maximize own score, minimize opponent's score
- **Optimizations**: Alpha-beta pruning, transposition tables

### **Monte Carlo Tree Search (MCTS)**
**Definition**: AI algorithm that builds a search tree using random sampling
- **Highbrow Equivalent**: Probabilistic planning with upper confidence bound exploration
- **Lowbrow Equivalent**: "Try a bunch of random moves and see what works"
- **Used In**: AlphaGo, advanced game AIs
- **Strength**: Excellent at complex games with large move spaces

---

## 📊 **Quality & Process Terminology**

### **Code Coverage**
**Definition**: Percentage of code exercised by automated tests
- **Highbrow Equivalent**: Structural coverage analysis of program execution paths
- **Lowbrow Equivalent**: "How much of your code actually gets tested"
- **Target**: 80%+ coverage for reliable software
- **Tools**: Coverage.py, Jest, pytest-cov

### **Linting**
**Definition**: Automated code quality checking and style enforcement
- **Highbrow Equivalent**: Static analysis for code quality and consistency
- **Lowbrow Equivalent**: "Robot that yells at you for bad code"
- **Tools**: Ruff (Python), ESLint (JavaScript), Prettier (formatting)
- **Benefits**: Catches bugs, enforces standards, improves maintainability

### **CI/CD - Continuous Integration/Continuous Deployment**
**Definition**: Automated testing and deployment pipeline
- **Highbrow Equivalent**: DevOps automation for quality assurance and delivery
- **Lowbrow Equivalent**: "Automatically test and deploy code when you push changes"
- **Components**: Build, test, deploy, monitor
- **Benefits**: Faster feedback, fewer bugs, reliable releases

---

## 🌐 **Infrastructure Terminology**

### **Containerization**
**Definition**: Packaging applications with their dependencies
- **Highbrow Equivalent**: OS-level virtualization for application isolation
- **Lowbrow Equivalent**: "Put your app in a box so it works everywhere"
- **Tools**: Docker, Podman, containerd
- **Benefits**: Consistent environments, easy deployment, isolation

### **Hybrid Docker Setup**
**Definition**: Running AI engines natively while web server runs in Docker
- **Highbrow Equivalent**: Mixed virtualization architecture for performance optimization
- **Lowbrow Equivalent**: "AI runs fast on Windows, web stuff runs in containers"
- **Why**: AI engines require Windows executables, can't run in Linux containers
- **Benefits**: Performance + isolation + remote accessibility

### **Reverse Proxy**
**Definition**: Server that forwards requests to appropriate backend services
- **Highbrow Equivalent**: HTTP request routing and load balancing intermediary
- **Lowbrow Equivalent**: "Traffic cop that sends requests to the right server"
- **Tools**: nginx, Caddy, Traefik
- **Use Case**: Routing `/api/chess` to Stockfish server, `/api/go` to KataGo server

---

## 🤖 **AI-Specific Terminology**

### **Hallucination**
**Definition**: AI generating incorrect or fabricated information
- **Highbrow Equivalent**: Confidence calibration failure in generative models
- **Lowbrow Equivalent**: "AI making shit up"
- **Prevention**: Grounding, fact-checking, confidence thresholds
- **Context**: Major challenge in AI reliability

### **Grounding**
**Definition**: Connecting AI outputs to verifiable facts and sources
- **Highbrow Equivalent**: Attribution and provenance tracking for AI outputs
- **Lowbrow Equivalent**: "Making sure AI answers are based on real stuff"
- **Methods**: Retrieval-augmented generation, source attribution
- **Benefits**: Improved accuracy, reduced hallucinations

### **Prompt Engineering**
**Definition**: Crafting inputs to get desired AI outputs
- **Highbrow Equivalent**: Optimization of natural language interfaces for AI systems
- **Lowbrow Equivalent**: "Writing good instructions to make AI do what you want"
- **Skills**: Clear instructions, examples, constraints, formatting
- **Importance**: Critical for reliable AI-assisted development

---

## 🚀 **Project-Specific Terminology**

### **FlowEngineer**
**Definition**: Individual who orchestrates human-AI collaborative development
- **Highbrow Equivalent**: AI development process architect and quality assurance lead
- **Lowbrow Equivalent**: "The human who tells AI what to do and checks the results"
- **Role**: Strategic planning, quality control, creative direction
- **Skills**: Technical knowledge + AI collaboration + project management

### **LLM Grunt**
**Definition**: AI assistant performing tactical implementation work
- **Highbrow Equivalent**: Large language model executing detailed development tasks
- **Lowbrow Equivalent**: "AI doing the actual coding and heavy lifting"
- **Role**: Code generation, debugging, optimization, documentation
- **Strengths**: Speed, consistency, knowledge breadth

### **Slop Avoidance Strategy**
**Definition**: Multi-layered approach to preventing low-quality AI outputs
- **Highbrow Equivalent**: Quality assurance framework for AI-generated content
- **Lowbrow Equivalent**: "Making sure AI doesn't produce crap"
- **Components**: LDDO analysis, cross-validation, human oversight
- **Results**: Enterprise-quality outputs from AI-assisted development

---

## 📝 **Contributing to This Dictionary**

### **Adding New Terms**
1. **Format**: Use the established structure (Definition, Highbrow/Lowbrow equivalents, Context)
2. **Clarity**: Explain complex terms in simple language
3. **Examples**: Include practical examples where helpful
4. **Cross-references**: Link to related terms and documentation

### **Term Selection Criteria**
- **Frequency**: Terms used frequently in the codebase/documentation
- **Confusion**: Terms that might confuse newcomers
- **Importance**: Critical concepts for understanding the project
- **Uniqueness**: Project-specific terminology

### **Maintenance**
- **Regular Updates**: Add new terms as the project evolves
- **Clarifications**: Improve explanations based on user feedback
- **Cross-references**: Ensure links remain current

---

**💡 Pro Tip**: When you encounter a confusing acronym or technical term in the documentation, check this dictionary first. If it's not here, suggest adding it!**
