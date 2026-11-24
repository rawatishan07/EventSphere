import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Users, Calendar, MapPin, Eye, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import EditEventModal from '../components/EditEventModal';

export default function OrganizerDashboard({ onOpenCreateModal, categories = [], venues = [] }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [manifestEvent, setManifestEvent] = useState(null);
  const [manifestAttendees, setManifestAttendees] = useState([]);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({ sort: 'date_asc' });
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      const res = await api.deleteEvent(event.id);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `Event #${event.id} removed successfully.` });
        loadEvents();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to delete event.' });
    }
  };

  const handleOpenManifest = async (event) => {
    setManifestEvent(event);
    setLoadingManifest(true);
    try {
      const res = await api.getBookings({ eventId: event.id });
      setManifestAttendees(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingManifest(false);
    }
  };

  // KPIs
  const totalOfferedSeats = events.reduce((sum, e) => sum + parseInt(e.total_seats || 0), 0);
  const totalBookedSeats = events.reduce((sum, e) => sum + parseInt(e.booked_seats || 0), 0);
  const overallOccupancy = totalOfferedSeats > 0 ? ((totalBookedSeats / totalOfferedSeats) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#ffffff',
        padding: '1.75rem 2rem',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Organizer & Event Management Hub
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
            Manage your schedule, track live ticket bookings, and view attendee guest lists.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadEvents} className="btn btn-secondary">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Host New Event</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Managed Events
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.35rem' }}>
            {events.length}
          </div>
          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>Active listings</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Seat Capacity
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {totalOfferedSeats.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>Across all venues</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tickets Reserved
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
            {totalBookedSeats.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.785rem', color: '#059669', fontWeight: 600 }}>Confirmed guests</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overall Occupancy
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>
            {overallOccupancy}%
          </div>
          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>Average capacity filled</span>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{
          padding: '0.95rem 1.25rem',
          borderRadius: '12px',
          backgroundColor: feedbackMsg.type === 'success' ? '#ecfdf5' : '#fff1f2',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
          color: feedbackMsg.type === 'success' ? '#059669' : '#e11d48',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* Events Table */}
      <div className="card" style={{ overflow: 'hidden', borderRadius: '18px' }}>
        <div style={{
          padding: '1.35rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Your Scheduled Events
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              View and manage status, seat inventory, and attendees
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            {events.length} Events Total
          </span>
        </div>

        <div className="table-responsive">
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Event Title & Category</th>
                <th>Venue & City</th>
                <th>Date & Time</th>
                <th>Capacity / Booked</th>
                <th>Available</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem' }}>Loading event records...</td>
                </tr>
              ) : events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{e.title}</div>
                    <span style={{
                      fontSize: '0.7rem',
                      backgroundColor: `${e.badge_color || '#4f46e5'}18`,
                      color: e.badge_color || '#4f46e5',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontWeight: 700
                    }}>
                      {e.category_name}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.venue_name}</div>
                    <div style={{ fontSize: '0.785rem', color: '#64748b' }}>{e.venue_city}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.event_date}</div>
                    <div style={{ fontSize: '0.785rem', color: '#64748b' }}>{e.start_time}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.booked_seats} / {e.total_seats}</div>
                    <div className="progress-bar-bg" style={{ width: '90px', height: '6px', marginTop: '6px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${e.occupancy_percentage}%`,
                          backgroundColor: e.occupancy_percentage > 90 ? '#e11d48' : '#059669'
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: e.remaining_seats <= 0 ? '#e11d48' : '#059669'
                    }}>
                      {e.remaining_seats} seats
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ${parseFloat(e.base_price).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge badge-${e.status.toLowerCase()}`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenManifest(e)}
                        title="View Attendee Guest List"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.65rem' }}
                      >
                        <Eye size={15} />
                        <span style={{ fontSize: '0.75rem' }}>Guests</span>
                      </button>

                      <button
                        onClick={() => setEditingEvent(e)}
                        title="Edit Event"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.65rem' }}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(e)}
                        title="Delete Event"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem 0.65rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manifest Viewer Modal */}
      {manifestEvent && (
        <div className="modal-overlay" onClick={() => setManifestEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div style={{
              padding: '1.5rem 1.75rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Attendee Guest List</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {manifestEvent.title}
                </p>
              </div>
              <button
                onClick={() => setManifestEvent(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0.45rem',
                  borderRadius: '8px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem 1.75rem' }}>
              {loadingManifest ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading guest list...</p>
              ) : manifestAttendees.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No attendees registered for this event yet.</p>
              ) : (
                <table className="dbms-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Attendee</th>
                      <th>Email</th>
                      <th>Seats</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manifestAttendees.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5' }}>
                          {a.booking_reference}
                        </td>
                        <td style={{ fontWeight: 600 }}>{a.user_name}</td>
                        <td style={{ color: '#64748b' }}>{a.user_email}</td>
                        <td style={{ fontWeight: 700 }}>{a.quantity}</td>
                        <td style={{ fontWeight: 700 }}>${parseFloat(a.total_amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${a.booking_status.toLowerCase()}`}>
                            {a.booking_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      <EditEventModal
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onEventUpdated={() => {
          loadEvents();
          setFeedbackMsg({ type: 'success', text: 'Event updated successfully.' });
        }}
        categories={categories}
        venues={venues}
      />
    </div>
  );
}
