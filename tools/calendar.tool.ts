export interface CreateCalendarEventOptions {
  company: string;
  role: string;
  recruiterName: string;
  dateTimeStr?: string;
}

export interface CalendarEventResult {
  success: boolean;
  eventId: string;
  summary: string;
  startTime: string;
  endTime: string;
  eventUrl: string;
}

export class CalendarTool {
  async createInterviewEvent(options: CreateCalendarEventOptions): Promise<CalendarEventResult> {
    console.log(`[CalendarTool] Booking Google Calendar Event for ${options.company}...`);

    let startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: Tomorrow
    if (options.dateTimeStr) {
      const parsed = new Date(options.dateTimeStr);
      if (!isNaN(parsed.getTime())) {
        startTime = parsed;
      }
    }

    const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45 min duration
    const eventId = `cal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const summary = `Interview: ${options.role} at ${options.company} w/ ${options.recruiterName}`;
    const eventUrl = `https://calendar.google.com/calendar/event?eid=${eventId}`;

    return {
      success: true,
      eventId,
      summary,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      eventUrl
    };
  }
}
