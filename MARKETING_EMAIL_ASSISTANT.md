# Marketing Email Assistant

## Overview

The Marketing Email Assistant is a comprehensive email campaign management tool that allows businesses to create, manage, and send targeted email campaigns to their customers. It includes AI-powered content generation, template management, recipient selection, and campaign analytics.

## Features

### 1. Campaign Creation
- **Intuitive Builder**: Visual email campaign creation with all necessary fields
- **AI Content Generation**: Generate personalized email content using AI based on business services and customer types
- **Template System**: Save and reuse email templates for consistent messaging
- **Campaign Types**: Support for different campaign types (general, past customers, uncommitted customers, all customers)

### 2. Recipient Management
- **Smart Segmentation**: Built-in selectable cards for different customer types:
  - Past Customers: Customers who have completed services
  - Uncommitted Customers: Customers who showed interest but didn't complete requests
  - All Customers: Complete customer database
  - Custom Selection: Manual recipient selection
- **Bulk Selection**: Select all or clear all recipients with one click
- **Customer Information**: View customer details including name, email, and status

### 3. Campaign Management
- **Save as Draft**: Save campaigns for later editing
- **Scheduling**: Schedule campaigns for future delivery
- **Status Tracking**: Monitor campaign status (draft, scheduled, sending, completed, failed)
- **Campaign History**: View all past campaigns with performance metrics

### 4. AI Content Generation
- **Service-Based Content**: AI generates content based on your business services
- **Customer-Specific Messaging**: Different content for past vs uncommitted customers
- **Multi-Language Support**: Content generation in multiple languages
- **Rate Limiting**: Built-in rate limiting to manage AI usage

### 5. Analytics & Reporting
- **Performance Metrics**: Track sent, opened, clicked, bounced, and unsubscribed counts
- **Open Rates**: Monitor email open rates
- **Click Rates**: Track click-through rates
- **Campaign Comparison**: Compare performance across different campaigns

### 6. Template System
- **Reusable Templates**: Create and save email templates
- **Template Categories**: Organize templates by type (general, promotional, newsletter, etc.)
- **Quick Loading**: Load templates into campaign builder with one click

## Database Schema

### New Tables Added

#### `marketingemailcampaign`
- Campaign details including name, subject, content, sender information
- Status tracking (draft, scheduled, sending, completed, failed)
- Performance metrics (sent, opened, clicked counts)
- Scheduling information

#### `marketingemailcampaignrecipient`
- Individual recipient tracking for each campaign
- Email delivery status (pending, sent, failed, bounced, opened, clicked)
- Customer information and engagement tracking

#### `marketingemailtemplate`
- Reusable email templates
- Template categorization and management
- Template versioning and updates

#### `marketingemailcampaignanalytics`
- Daily analytics data for campaigns
- Performance metrics aggregation
- Historical data for trend analysis

## Usage

### Creating a Campaign

1. **Navigate to Email Assistant**: Go to Dashboard → Email Assistant
2. **Compose Tab**: Use the compose tab to create your campaign
3. **Fill Campaign Details**:
   - Campaign name
   - Subject line
   - Email content
   - Sender information
4. **Generate AI Content**: Click "Generate Past Customers" or "Generate Uncommitted" to create AI-powered content
5. **Select Recipients**: Go to the Recipients tab to choose your audience
6. **Schedule or Send**: Choose to send immediately or schedule for later

### Managing Recipients

1. **Recipients Tab**: Navigate to the recipients tab
2. **Choose Recipient Type**: Select from past customers, uncommitted customers, all customers, or custom selection
3. **Select Recipients**: Use checkboxes to select individual recipients or use "Select All"
4. **Review Selection**: See the count of selected recipients

### Using Templates

1. **Templates Tab**: Go to the templates tab
2. **Create Template**: Fill in template details and save
3. **Load Template**: Use the "Choose Template" button in the compose tab to load a saved template
4. **Edit and Send**: Modify the loaded template and send as a campaign

### Viewing Analytics

1. **Campaigns Tab**: View all your campaigns
2. **Analytics Button**: Click the analytics button on any campaign
3. **Performance Metrics**: Review sent, opened, clicked, and bounce rates

## Technical Implementation

### File Structure
```
quevo-app/src/app/[locale]/dashboard/marketing-email-assistant/
├── page.tsx                           # Main page component
├── marketing-email-assistant-wrapper.tsx  # Main wrapper component
├── actions.ts                         # Server actions
└── generate-email-content.ts          # AI content generation
```

### Key Components

#### `MarketingEmailAssistantWrapper`
- Main UI component with tabs for different functions
- Campaign creation form
- Recipient selection interface
- Template management
- Campaign analytics

#### Server Actions
- `createEmailCampaign`: Create new campaigns
- `sendEmailCampaign`: Send campaigns to recipients
- `saveEmailTemplate`: Save reusable templates
- `generateMarketingEmailContent`: AI content generation
- `getCampaignAnalytics`: Retrieve campaign performance data

### Rate Limiting
- Email sending rate limiting based on plan
- AI content generation rate limiting
- Automatic token refill system

### Integration Points
- Uses existing customer data from service requests
- Integrates with business services for AI content generation
- Leverages existing authentication and business context

## Future Enhancements

1. **Email Service Integration**: Connect with Resend or other email services
2. **Advanced Segmentation**: More sophisticated customer segmentation
3. **A/B Testing**: Test different subject lines and content
4. **Automation**: Automated campaign triggers based on customer behavior
5. **Advanced Analytics**: More detailed reporting and insights
6. **Email Templates**: Pre-built professional email templates
7. **Compliance**: GDPR and email compliance features

## Rate Limits

### Email Sending
- Based on user plan limits
- Automatic rate limiting to prevent abuse
- Token-based system with automatic refill

### AI Content Generation
- Limited generations per day based on plan
- Rate limiting to manage API costs
- Automatic refill system

## Security & Privacy

- All email content is stored securely
- Customer data is protected and only used for intended purposes
- Rate limiting prevents abuse
- Authentication required for all operations
- Business-specific data isolation
