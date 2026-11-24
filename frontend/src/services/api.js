// API client for EventSphere (auto-falls back to local browser store on static hosts like Netlify)
import { fallbackApi } from './fallbackApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let activeUser = { id: 2, role: 'attendee' };

function getAuthHeaders() {
  return {
    'x-user-id': String(activeUser?.id || ''),
    'x-user-role': String(activeUser?.role || '')
  };
}

async function request(path, options = {}, fallbackFn) {
  try {
    const mergedOptions = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    };
    const res = await fetch(`${BASE_URL}${path}`, mergedOptions);
    const contentType = res.headers.get('content-type') || '';
    // Static hosts (e.g. Netlify SPA redirect) return text/html instead of JSON for /api/*
    if (!contentType.includes('application/json')) {
      return fallbackFn();
    }
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `HTTP error ${res.status}`);
    }
    return json;
  } catch (err) {
    // Only fall back on network / non-JSON errors, not explicit API validation errors
    if (err instanceof TypeError || err.name === 'SyntaxError') {
      return fallbackFn();
    }
    throw err;
  }
}

export const api = {
  setCurrentUser(user) {
    if (user) activeUser = { id: user.id, role: user.role };
  },

  getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.city) query.append('city', params.city);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    return request(`/events?${query.toString()}`, undefined, () => fallbackApi.getEvents(params));
  },

  getEventById(id) {
    return request(`/events/${id}`, undefined, () => fallbackApi.getEventById(id));
  },

  createEvent(data) {
    return request(
      '/events',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) },
      () => fallbackApi.createEvent(data, activeUser)
    );
  },

  updateEvent(id, data) {
    return request(
      `/events/${id}`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) },
      () => fallbackApi.updateEvent(id, data, activeUser)
    );
  },

  deleteEvent(id) {
    return request(`/events/${id}`, { method: 'DELETE' }, () => fallbackApi.deleteEvent(id, activeUser));
  },

  getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    if (params.eventId) query.append('eventId', params.eventId);
    if (params.status) query.append('status', params.status);
    return request(`/bookings?${query.toString()}`, undefined, () => fallbackApi.getBookings(params));
  },

  getBookingById(id) {
    return request(`/bookings/${id}`, undefined, () => fallbackApi.getBookingById(id));
  },

  bookTickets(payload) {
    return request(
      '/bookings',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
      () => fallbackApi.bookTickets(payload, activeUser)
    );
  },

  cancelBooking(id) {
    return request(`/bookings/${id}/cancel`, { method: 'POST' }, () => fallbackApi.cancelBooking(id, activeUser));
  },

  getVenues() {
    return request('/venues', undefined, () => fallbackApi.getVenues());
  },

  getCategories() {
    return request('/venues/categories/all', undefined, () => fallbackApi.getCategories());
  },

  getUsers(role = '') {
    const query = role ? `?role=${role}` : '';
    return request(`/users${query}`, undefined, () => fallbackApi.getUsers(role));
  },

  createUser(data) {
    return request(
      '/users',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) },
      () => fallbackApi.createUser(data, activeUser)
    );
  },

  getDbmsOverview() {
    return request('/dbms/overview', undefined, () => fallbackApi.getDbmsOverview());
  }
};
