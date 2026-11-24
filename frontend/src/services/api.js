// API client for EventSphere
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || `HTTP error ${response.status}`);
  }
  return json;
}

export const api = {
  // Events
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.city) query.append('city', params.city);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    
    const res = await fetch(`${BASE_URL}/events?${query.toString()}`);
    return handleResponse(res);
  },

  async getEventById(id) {
    const res = await fetch(`${BASE_URL}/events/${id}`);
    return handleResponse(res);
  },

  async createEvent(data) {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateEvent(id, data) {
    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Bookings & Tickets
  async getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    if (params.eventId) query.append('eventId', params.eventId);
    if (params.status) query.append('status', params.status);

    const res = await fetch(`${BASE_URL}/bookings?${query.toString()}`);
    return handleResponse(res);
  },

  async getBookingById(id) {
    const res = await fetch(`${BASE_URL}/bookings/${id}`);
    return handleResponse(res);
  },

  async bookTickets(payload) {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async cancelBooking(id) {
    const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Venues, Categories, Users
  async getVenues() {
    const res = await fetch(`${BASE_URL}/venues`);
    return handleResponse(res);
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/venues/categories/all`);
    return handleResponse(res);
  },

  async getUsers(role = '') {
    const query = role ? `?role=${role}` : '';
    const res = await fetch(`${BASE_URL}/users${query}`);
    return handleResponse(res);
  }
};

