import { api } from '../api';
import { config } from '../../config/environment';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  type: 'hourse' | 'personal' | 'work' | 'school' | 'medical' | 'other';
  color: string;
  attendees: string[];
  createdBy: string;
  familyId?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  reminders: {
    type: 'push' | 'email' | 'sms';
    time: number;
  }[];
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  type: Event['type'];
  attendees?: string[];
  recurring?: Event['recurring'];
  reminders?: Event['reminders'];
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface CalendarFilters {
  startDate?: string;
  endDate?: string;
  type?: Event['type'];
  familyId?: string;
  createdBy?: string;
}

class CalendarService {
  private baseUrl = '/calendar';

  async getEvents(filters?: CalendarFilters): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.familyId) params.append('familyId', filters.familyId);
      if (filters?.createdBy) params.append('createdBy', filters.createdBy);

      const response = await api.get(`${this.baseUrl}/events?${params.toString()}`);
      const data = response.data;
      const items: any[] = data?.events || data?.data || data || [];
      return items as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const response = await api.post(`${this.baseUrl}/events`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventData: UpdateEventData): Promise<Event> {
    try {
      const { id, ...data } = eventData;
      const response = await api.put(`${this.baseUrl}/events/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/events/${eventId}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  }

  async getEventsByType(type: Event['type']): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events by type:', error);
      throw error;
    }
  }

  async getFamilyEvents(familyId: string): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/hourse/${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hourse events:', error);
      throw error;
    }
  }

  async addAttendee(eventId: string, attendeeId: string): Promise<Event> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/attendees`, {
        attendeeId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  }

  async removeAttendee(eventId: string, attendeeId: string): Promise<Event> {
    try {
      const response = await api.delete(`${this.baseUrl}/events/${eventId}/attendees/${attendeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing attendee:', error);
      throw error;
    }
  }

  async addReminder(eventId: string, reminder: Event['reminders'][0]): Promise<Event> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/reminders`, reminder);
      return response.data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  }

  async removeReminder(eventId: string, reminderIndex: number): Promise<Event> {
    try {
      const response = await api.delete(`${this.baseUrl}/events/${eventId}/reminders/${reminderIndex}`);
      return response.data;
    } catch (error) {
      console.error('Error removing reminder:', error);
      throw error;
    }
  }

  // Removed mock data; rely on backend endpoints only
}

export const calendarService = new CalendarService();
export default calendarService; 