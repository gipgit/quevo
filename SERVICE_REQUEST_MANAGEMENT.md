# Service Request Management System

## Overview

The new Service Request Management System provides an Outlook-like interface for efficiently managing customer service requests. It features a two-panel layout with a request list on the left and detailed view on the right, complete with keyboard shortcuts and action buttons.

## Features

### Layout
- **Left Panel**: List of service requests with basic information
- **Right Panel**: Detailed view of selected request with all related information
- **Progress Bar**: Shows how many requests are handled vs. remaining

### Request Information Display
- Request reference and status
- Customer details (name, email, phone)
- Service information and pricing
- Customer notes and internal notes
- Linked service board actions
- Message history
- Priority and urgency flags

### Action Buttons
- **Mark as Handled** (Ctrl+H): Mark request as completed
- **Generate Quotation** (Ctrl+Q): Open quotation generator
- **Flag Urgent** (Ctrl+F): Toggle urgency flag
- **WhatsApp** (Ctrl+W): Share on WhatsApp
- **Email** (Ctrl+E): Share via email
- **Copy Contacts** (Ctrl+C): Copy customer contact information

### Keyboard Navigation
- **Arrow Up/Down**: Navigate between requests
- **Enter**: Mark current request as handled
- **Ctrl+H**: Mark as handled
- **Ctrl+Q**: Generate quotation
- **Ctrl+F**: Toggle urgency flag
- **Ctrl+W**: Share on WhatsApp
- **Ctrl+E**: Share via email
- **Ctrl+C**: Copy customer contacts

### Visual Indicators
- **Handled Requests**: Green checkmark icon
- **New Requests**: Blue dot indicator
- **Urgent Requests**: Red flag icon
- **Priority Levels**: Color-coded priority icons

## Database Schema Updates

### New Fields Added to ServiceRequest Table

```sql
-- New columns for enhanced request management
is_handled            BOOLEAN DEFAULT FALSE, -- Track if request has been handled
handled_at            TIMESTAMP, -- When the request was handled
handled_by            VARCHAR(100), -- Who handled the request
priority              VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
urgency_flag          BOOLEAN DEFAULT FALSE, -- Flag for urgent requests
assigned_to           VARCHAR(100), -- Staff member assigned to handle
estimated_completion  TIMESTAMP, -- Estimated completion date
actual_completion     TIMESTAMP, -- Actual completion date
customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5), -- 1-5 rating
follow_up_required    BOOLEAN DEFAULT FALSE, -- Whether follow-up is needed
follow_up_date        TIMESTAMP, -- When to follow up
tags                  JSONB, -- Array of tags for categorization
```

## API Endpoints

### Mark Request as Handled
```
PATCH /api/service-requests/[request_id]/mark-handled
```

### Toggle Urgency Flag
```
PATCH /api/service-requests/[request_id]/toggle-urgency
```

### Fetch Service Requests (Enhanced)
```
GET /api/businesses/[business_id]/service-requests
```

## Implementation Notes

### Current Status
- The interface is fully functional with the existing database schema
- New database fields are added but commented out until Prisma client is regenerated
- Fallback logic handles cases where new fields aren't available yet

### To Complete Implementation
1. Regenerate Prisma client after database migration
2. Uncomment new fields in API routes and page components
3. Run database migration to add new columns
4. Test all functionality with real data

### Responsive Design
- The interface is responsive and works on desktop and tablet
- Mobile view may need additional optimization for smaller screens

## Usage Instructions

1. **Navigate to Service Requests**: Go to Dashboard > Service Requests
2. **View Progress**: Check the progress bar at the top to see handled vs. unhandled requests
3. **Select Request**: Click on any request in the left panel to view details
4. **Take Actions**: Use the action buttons or keyboard shortcuts to manage requests
5. **Navigate**: Use arrow keys or click to move between requests

## Future Enhancements

- Bulk actions for multiple requests
- Advanced filtering and search
- Email templates for automated responses
- Integration with calendar for scheduling
- Customer satisfaction surveys
- Analytics and reporting dashboard
