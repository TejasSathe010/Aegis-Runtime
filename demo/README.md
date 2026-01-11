# Aegis Runtime - Interactive Demo

Interactive demo application showcasing Aegis Runtime governance capabilities in action.

## What This Demo Shows

This demo provides a hands-on experience with Aegis Runtime's core features:

- **Core Package**: Policy enforcement and budget management
- **OpenAI Adapter**: Direct integration with OpenAI API
- **Proxy Server**: HTTP proxy with multi-provider support

## Quick Start

```bash
cd demo
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser.

## Features

### 1. Configuration Panel

Configure your API keys, provider settings, and governance policies:

- **API Keys**: OpenAI and Gemini (masked for security)
- **Provider Selection**: Choose OpenAI or Gemini
- **Model Configuration**: Select models to use
- **Governance Toggle**: Enable/disable policy enforcement
- **Budget Limits**: Set per-run, per-minute, and per-day limits

### 2. Core Package Demo (@aegis/core)

Test policy enforcement and budget management:

- **Policy Validation**: See how capabilities and model allowlists work
- **Budget Tracking**: Real-time budget usage display
- **Budget Enforcement**: Hard stops when limits are reached
- **Window-Based Tracking**: Per-run, per-minute, and per-day limits

### 3. OpenAI Adapter Demo (@aegis/adapters-openai)

Test OpenAI API integration:

- **Chat Completions**: Make actual API calls through the adapter
- **Usage Tracking**: See token usage and cost estimation
- **Response Preview**: View API responses in real-time

### 4. Proxy Server Demo (@aegis/proxy)

Test the HTTP proxy server:

- **Health Check**: Verify proxy server is running
- **Chat Completions**: Make requests through the proxy
- **Multi-Provider Routing**: Automatic routing based on model name
- **Error Handling**: See how errors are handled and displayed

## Setup

### Prerequisites

- Node.js 18+
- pnpm 9+
- OpenAI API key (for OpenAI adapter and proxy)
- Gemini API key (optional, for Gemini provider)

### Running the Demo

1. **Install dependencies**:
   ```bash
   cd demo
   pnpm install
   ```

2. **Start the demo**:
   ```bash
   pnpm dev
   ```

3. **Configure API keys**:
   - Enter your OpenAI API key in the configuration panel
   - Optionally enter your Gemini API key for multi-provider testing

### Running the Proxy Server (Optional)

To test the proxy server demo, start the proxy in a separate terminal:

```bash
export OPENAI_API_KEY="your-openai-key"
export GEMINI_API_KEY="your-gemini-key"
export AEGIS_DEFAULT_PROVIDER="openai"
pnpm --filter @aegis/proxy dev
```

Then in the demo:
- Set the proxy URL to `http://localhost:8787`
- Click "Check Health" to verify connection
- Use "Test Chat Completions" to make requests

## What You'll Learn

By using this demo, you'll understand:

1. **Policy Enforcement**: How policies control access and usage
2. **Budget Management**: How budgets are tracked and enforced in real-time
3. **Multi-Provider Routing**: How requests are routed to different providers
4. **Usage Tracking**: How tokens and costs are tracked
5. **Error Handling**: How errors are caught and reported
6. **Audit Logging**: How operations are logged for compliance

## Architecture

The demo is built with:

- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Aegis Runtime Packages**: Core, OpenAI Adapter, and Proxy

## Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── ConfigPanel.tsx      # Configuration UI
│   │   ├── CoreDemo.tsx          # Core package demo
│   │   ├── OpenAIAdapterDemo.tsx # OpenAI adapter demo
│   │   └── ProxyDemo.tsx         # Proxy server demo
│   ├── App.tsx                   # Main app component
│   ├── index.css                 # Global styles
│   └── main.tsx                  # Entry point
├── package.json
└── README.md
```

## Customization

You can customize the demo by:

- Modifying `src/components/*.tsx` to add more test scenarios
- Updating `src/App.tsx` to change the layout
- Adjusting `src/index.css` for styling changes

## Deployment

The demo can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Build and deploy the `dist` folder

## License

MIT - Same as Aegis Runtime
