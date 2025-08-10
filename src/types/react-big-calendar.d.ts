declare module 'react-big-calendar' {
  import { ComponentType } from 'react';
  
  export interface CalendarProps {
    localizer: any;
    events: any[];
    startAccessor: string;
    endAccessor: string;
    style?: React.CSSProperties;
    date?: Date;
    defaultDate?: Date;
    onNavigate?: (newDate: Date) => void;
    onSelectEvent?: (event: any) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
    selectable?: boolean;
    eventPropGetter?: (event: any) => { style: React.CSSProperties };
    messages?: any;
    views?: string[];
    defaultView?: string;
    step?: number;
    timeslots?: number;
    className?: string;
    components?: any;
  }
  
  export const Calendar: ComponentType<CalendarProps>;
  export const dateFnsLocalizer: (config: any) => any;
} 