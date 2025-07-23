import React from 'react';

const DashboardEventCard = ({ event }: { event: any }) => (
  <div style={{
    background: '#2563eb',
    color: 'white',
    borderRadius: 6,
    padding: '8px 12px', // increased padding
    fontSize: 14,        // slightly larger font
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal', // allow wrapping
    minHeight: 40,        // increased minHeight
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }}>
    <div style={{ fontWeight: 600 }}>{event.title}</div>
    {event.customerName && <div style={{ fontSize: 12 }}>{event.customerName}</div>}
  </div>
);

export default DashboardEventCard; 