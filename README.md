# DeepAgents Open Lovable

An open-source AI-powered frontend development platform built on [DeepAgents](https://github.com/langchain-ai/deepagents) and LangGraph. Generate complete React applications through natural language conversations.

## Overview

This platform enables you to build frontend applications by simply describing what you want. The AI agent understands modern web development best practices and generates production-ready code using React, Next.js, Tailwind CSS, and shadcn/ui.

### Key Features

- **Conversational UI Development** - Describe your app in plain English and watch it come to life
- **Live Preview** - See your application render in real-time as the agent writes code
- **File System Management** - Browse, edit, and manage generated files through an intuitive interface
- **Sub-Agent Architecture** - Specialized agents for design and image research work alongside the main agent
- **Vercel Deploy** - One-click deployment to Vercel for instant preview URLs

## Screenshots

### Starting a New Project

![Starting a chat with a prompt](images/img.png)

Begin by describing your application in natural language. The agent understands your requirements and starts planning the implementation.

### Live Development in Progress

![CodeCraft website in development](images/img_1.png)

Watch as the agent works on your project. This example shows the "CodeCraft" website being built with real-time task tracking and progress updates.

### Sub-Agent Architecture in Action

![Designer sub-agent at work](images/img_2.png)

Specialized sub-agents handle specific tasks. Here, the **designer** sub-agent is creating files while you can see the filesystem structure being built in real-time.

### Final Result

![CodeCraft website final result](images/img_3.png)

The completed application preview. From concept to working website through simple conversation.

## Architecture

```
deepagents-open-lovable/
├── agent/                    # Python backend (LangGraph)
│   ├── src/
│   │   ├── agent.py         # Main agent configuration
│   │   ├── prompts.py       # System prompts
│   │   ├── tools.py         # Custom tools
│   │   ├── subagents.py     # Designer & image researcher
│   │   └── skills/          # Skill definitions
│   └── langgraph.json       # LangGraph configuration
└── gui/                      # React/Vite frontend
    └── src/
        ├── components/      # UI components
        ├── hooks/           # Custom React hooks
        ├── pages/           # Route components
        └── api/             # Backend API client
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- **LLM:** An [Anthropic API key](https://console.anthropic.com/) **or** [AWS Bedrock](https://aws.amazon.com/bedrock/) access (set `USE_BEDROCK=true` and AWS credentials)

### 1. Clone the Repository

```bash
git clone https://github.com/emanueleielo/deepagents-open-lovable.git
cd deepagents-open-lovable
```

### 2. Set Up the Agent (Backend)

```bash
cd agent

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: add ANTHROPIC_API_KEY, or set USE_BEDROCK=true and AWS credentials for Bedrock
```

### 3. Set Up the GUI (Frontend)

```bash
cd ../gui

# Install dependencies
npm install

# Configure environment (optional)
cp gui.example .env
```

### 4. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd agent
langgraph dev
# Runs at http://localhost:2024
```

**Terminal 2 - Frontend:**
```bash
cd gui
npm run dev
# Runs at http://localhost:5173
```

Open your browser to `http://localhost:5173` and start building!

## Configuration

### Agent Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key (omit when using Bedrock) |
| `USE_BEDROCK` | No | Set `true` to use **AWS Bedrock** (Claude) instead of Anthropic API |
| `AWS_REGION` | No | AWS region for Bedrock (default: `us-east-1`) |
| `BEDROCK_MODEL_ID` | No | Bedrock model ID (defaults from `MODEL` or Claude Sonnet 4.5) |
| `MODEL` | No | Model name (default: `anthropic:claude-sonnet-4-5-20250929`) |
| `TAVILY_API_KEY` | No | Tavily API key for web search |

\* Use either `ANTHROPIC_API_KEY` or `USE_BEDROCK=true` with AWS credentials (env or IAM).

### GUI Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | LangGraph API URL (default: `http://localhost:2024`) |
| `VERCEL_API_TOKEN` | No | Vercel token for preview deployments |

### AWS Bedrock

To use **AWS Bedrock** instead of the Anthropic API: enable Claude in [Bedrock Model access](https://console.aws.amazon.com/bedrock/home#/modelaccess), set `USE_BEDROCK=true` and `AWS_REGION`, and provide credentials via `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` or an IAM role. See [DEPLOYMENT.md](DEPLOYMENT.md).

### Deploy (AWS Lambda + Vercel or Amplify)

Deploy the repo **as-is** with the included configs:

- **Agent:** Deploy to **AWS Lambda** (container image + Web Adapter) — see [DEPLOY_AWS_LAMBDA.md](DEPLOY_AWS_LAMBDA.md). Or use `agent/Dockerfile` on ECS, App Runner, or any Docker host. Set `USE_BEDROCK=true` and AWS env for Bedrock.
- **GUI:** Use `gui/vercel.json` (Vercel) or `amplify.yml` (AWS Amplify). Set `VITE_API_URL` to your Lambda Function URL (or agent URL) at build time.

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions.

## Tech Stack

**Backend:**
- Python 3.11+
- [DeepAgents](https://github.com/langchain-ai/deepagents) - AI agent framework
- [LangGraph](https://github.com/langchain-ai/langgraph) - Stateful agent orchestration
- [LangChain](https://github.com/langchain-ai/langchain) - LLM tooling
- Claude (Anthropic) - Language model

**Frontend:**
- React 18 + TypeScript
- Vite - Build tool
- Tailwind CSS - Styling
- [Sandpack](https://sandpack.codesandbox.io/) - Live code preview
- react-router-dom - Routing

## Development

### Adding Custom Tools

Create new tools in `agent/src/tools.py`:

```python
from langchain_core.tools import tool

@tool
def my_custom_tool(param: str) -> str:
    """Tool description for the agent."""
    return f"Result: {param}"
```

### Adding Sub-Agents

Define sub-agents in `agent/src/subagents.py`:

```python
subagents = [
    {
        "name": "my-agent",
        "description": "What this agent does",
        "prompt": "System prompt for the agent",
    }
]
```

### Adding Skills

Create skill files in `agent/src/skills/<skill-name>/SKILL.md`:

```markdown
# Skill Name

Description of what this skill does.

## Instructions

Step-by-step instructions for the agent.
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source. See the individual components for their respective licenses.

## Acknowledgments

- [LangChain](https://langchain.com/) for the amazing AI tooling
- [Anthropic](https://anthropic.com/) for Claude
- [DeepAgents](https://github.com/langchain-ai/deepagents) for the agent framework
