# AI Chat Assistant

This directory contains the AI chat assistant feature for business profiles. The AI assistant allows users to interact with businesses through a conversational interface.

## Features

- **Services Information**: Users can ask about available services and get detailed information
- **Quotation Simulation**: AI can generate estimated quotes for services
- **Contact Information**: Provides business contact details (phone, email)
- **Product Catalog**: Shows available products and categories
- **Promotions**: Displays active promotions and offers
- **Rewards Program**: Information about loyalty programs and rewards
- **Business Information**: General information about the business

## File Structure

```
ai/
├── page.tsx                    # Main server component
├── layout.tsx                  # Layout wrapper
├── AIChatClientWrapper.tsx     # Client-side chat interface
├── AIChatMessage.tsx          # Individual message component
├── AIChatInput.tsx            # Input field component
├── AIChatSuggestions.tsx      # Quick action suggestions
└── README.md                  # This file
```

## Components

### AIChatClientWrapper.tsx
Main client component that manages:
- Chat state and messages
- API communication
- UI layout and theming
- Message handling and display

### AIChatMessage.tsx
Renders individual chat messages with:
- User vs assistant message styling
- Structured data display (services, products, etc.)
- Timestamps
- Responsive design

### AIChatInput.tsx
Input interface with:
- Auto-resizing textarea
- Send button with loading states
- Quick action buttons
- Keyboard shortcuts (Enter to send)

### AIChatSuggestions.tsx
Quick action cards for common queries:
- Services
- Quotations
- Contact information
- Products
- Promotions
- Rewards

## API Integration

The AI chat uses the `/api/ai-chat` endpoint for processing messages. The endpoint:

1. Receives user messages and business context
2. Fetches relevant business data from the database
3. Generates contextual responses
4. Returns structured data for rich message display

## Styling

The AI chat uses the business's theme colors and integrates with the existing design system. CSS classes are defined in `/app/styles/ai-chat.css`.

## Usage

Users can access the AI chat by navigating to:
```
/{locale}/{business_urlname}/ai
```

Example: `/en/nutrizionista_equilibrio/ai`

## Supported Queries

The AI assistant can handle various types of queries:

- **Services**: "Mostrami i servizi", "Cosa offrite"
- **Quotations**: "Voglio un preventivo", "Quanto costa"
- **Contact**: "Contatti", "Come posso chiamarvi"
- **Products**: "Mostrami i prodotti", "Menu"
- **Promotions**: "Promozioni attive", "Offerte"
- **Rewards**: "Programma premi", "Punti"
- **Business Info**: "Chi siete", "Informazioni"

## Future Enhancements

- Integration with real AI services (OpenAI, etc.)
- Multi-language support
- Voice input/output
- File sharing capabilities
- Appointment booking through chat
- Payment processing
- Analytics and insights
