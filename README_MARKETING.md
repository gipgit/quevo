# Marketing Content Generator

This feature allows businesses to generate AI-powered marketing content based on their services using OpenAI's GPT-4o-mini model.

## Setup

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

You can get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys).

### 2. Features

- **Server-Side Data Fetching**: Services and business data are fetched on the server for optimal performance
- **AI Content Generation**: Uses OpenAI's GPT-4o-mini model to generate:
  - Email marketing content (200-300 words)
  - Social media post titles and descriptions
- **Copy to Clipboard**: All generated content can be easily copied with one click
- **Internationalization**: Fully supports multiple languages
- **Dark/Light Theme**: Adapts to the user's theme preference

### 3. Architecture

- **Server Component** (`page.tsx`): Simple wrapper that renders the Client Component
- **Client Component** (`marketing-wrapper.tsx`): Handles data fetching, state management, and DashboardLayout
- **Client Component** (`marketing-content-display.tsx`): Manages UI state and user interactions for the marketing content
- **Server Action** (`actions.ts`): Wraps the AI generation function for secure server-side execution
- **AI Generation** (`generate-marketing-content.ts`): Contains the core AI logic using Vercel AI SDK

### 4. Usage

1. Navigate to the Marketing section in your dashboard
2. View your business and services information
3. Click "Generate Content" to create AI-powered marketing materials
4. Copy the generated content for use in your marketing campaigns

### 5. Content Generation

The AI generates content based on:
- Business name and description
- Service details (name, description, price, duration)
- Service items, questions, and requirements
- Service categories

The generated content is optimized for:
- Email marketing campaigns
- Social media posts (Facebook, Instagram, etc.)
- Professional and engaging tone
- Value-focused messaging

### 6. Security

- API keys are kept secure on the server
- All AI calls are made through Server Actions
- No sensitive data is exposed to the client

### 7. Performance

- Data is fetched once on page load
- AI generation is triggered on-demand
- Content is cached in component state
- Optimized for weekly content generation cycles
