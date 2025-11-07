# howto

Autonomous development powered by **Miyabi** - AI-driven development framework.

## Getting Started

### Prerequisites

```bash
# Set environment variables
cp .env.example .env
# Edit .env and add your tokens
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev          # Run development server
npm run build        # Build project
npm test             # Run tests
npm run typecheck    # Check types
npm run lint         # Lint code
```

## Project Structure

```
howto/
├── src/              # Source code
│   └── index.ts     # Entry point
├── tests/           # Test files
│   └── example.test.ts
├── .claude/         # AI agent configuration
│   ├── agents/      # Agent definitions
│   └── commands/    # Custom commands
├── .github/
│   ├── workflows/   # CI/CD automation
│   └── labels.yml   # Label system (53 labels)
├── CLAUDE.md        # AI context file
└── package.json
```

## Miyabi Framework

This project uses **7 autonomous AI agents**:

1. **CoordinatorAgent** - Task planning & orchestration
2. **IssueAgent** - Automatic issue analysis & labeling
3. **CodeGenAgent** - AI-powered code generation
4. **ReviewAgent** - Code quality validation (80+ score)
5. **PRAgent** - Automatic PR creation
6. **DeploymentAgent** - CI/CD deployment automation
7. **TestAgent** - Test execution & coverage

### Workflow

1. **Create Issue**: Describe what you want to build
2. **Agents Work**: AI agents analyze, implement, test
3. **Review PR**: Check generated pull request
4. **Merge**: Automatic deployment

### Label System

Issues transition through states automatically:

- `📥 state:pending` - Waiting for agent assignment
- `🔍 state:analyzing` - Being analyzed
- `🏗️ state:implementing` - Code being written
- `👀 state:reviewing` - Under review
- `✅ state:done` - Completed & merged

## Commands

```bash
# Check project status
npx miyabi status

# Watch for changes (real-time)
npx miyabi status --watch

# Create new issue
gh issue create --title "Add feature" --body "Description"
```

## Configuration

### Environment Variables

Required variables (see `.env.example`):

- `GITHUB_TOKEN` - GitHub personal access token
- `ANTHROPIC_API_KEY` - Claude API key (optional for local development)
- `REPOSITORY` - Format: `owner/repo`

### GitHub Actions

Workflows are pre-configured in `.github/workflows/`:

- CI/CD pipeline
- Automated testing
- Deployment automation
- Agent execution triggers

**Note**: Set repository secrets at:
`https://github.com/buchobucho/howto/settings/secrets/actions`

Required secrets:
- `GITHUB_TOKEN` (auto-provided by GitHub Actions)
- `ANTHROPIC_API_KEY` (add manually for agent execution)

## Features

### Lark API Integration

This project includes full Lark（飛書/Feishu）API integration for creating and managing Bases (Bitables).

**Quick Start:**

```typescript
import { LarkService } from './src/services/LarkService.js';

const larkService = new LarkService({
  appId: process.env.LARK_APP_ID!,
  appSecret: process.env.LARK_APP_SECRET!,
});

// Create a complete Base with table and records
const result = await larkService.createCompleteBase(
  'Task Management',
  'タスク一覧',
  [
    { field_name: 'タスク名', type: 1 },
    { field_name: '完了', type: 7 },
  ],
  [{ fields: { タスク名: 'サンプル', 完了: false } }]
);
```

**Features:**
- ✅ Create Bitables (Bases)
- ✅ Create tables with custom fields
- ✅ CRUD operations for records
- ✅ Batch operations for efficiency
- ✅ Filter & sort support
- ✅ 19 field types supported
- ✅ Full TypeScript support

**Documentation:**
- [Complete API Guide](./docs/LARK_API_GUIDE.md)
- [Usage Examples](./examples/lark-example.ts)
- [Demo Script](./examples/lark-demo.ts)

**Run Demo:**

```bash
export LARK_APP_ID="your_app_id"
export LARK_APP_SECRET="your_app_secret"
npx tsx examples/lark-demo.ts
```

This creates 3 practical Bases:
1. 📋 Task Management System
2. 👥 CRM System
3. 📦 Inventory Management System

---

### Landing Page

Professional landing page for programming schools targeting career changers.

**Features:**
- Responsive design (mobile-first)
- Hero section with statistics
- Curriculum timeline
- Pricing plans (¥298,000 - ¥698,000)
- FAQ accordion
- Contact form with validation

**View:** Open `lp/index.html` in your browser

---

### XTEP-like Application

X (Twitter) marketing automation tool with:
- Automated DM/Reply sending
- Campaign management (lottery systems)
- Post scheduling
- Analytics dashboard

**Run:**
```bash
npm run dev
```

---

## Documentation

- **Lark API Guide**: [docs/LARK_API_GUIDE.md](./docs/LARK_API_GUIDE.md)
- **Course Materials**: [docs/README.md](./docs/README.md) - AI×TikTok Affiliate Marketing
- **Miyabi Framework**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Label System**: See `.github/labels.yml`
- **Agent Operations**: See `CLAUDE.md`

## Support

- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues
- **Discord**: [Coming soon]

## License

MIT

---

✨ Generated by [Miyabi](https://github.com/ShunsukeHayashi/Miyabi)
