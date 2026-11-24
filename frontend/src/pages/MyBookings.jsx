import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, AlertTriangle, CheckCircle, QrCode, XCircle } from 'lucide-react';
import { api } from '../services/api';
import TicketPassModal from '../components/TicketPassModal';

export default function MyBookings({ currentUser, users = [], onOpenBookingPass }) {
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || 4);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePassBooking, setActivePassBooking] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings({ userId: selectedUserId });
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    loadBookings();
  }, [selectedUserId]);

  const handleCancelBooking = async (booking) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking #${booking.booking_reference}? \n\n${booking.quantity} ticket(s) will be refunded and made available for other attendees.`
    );
    if (!confirmCancel) return;

    setCancellingId(booking.id);
    try {
      const res = await api.cancelBooking(booking.id);
      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Booking #${booking.booking_reference} has been cancelled and refunded.`
        });
        loadBookings();
      }
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to cancel booking.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewTickets = async (bookingId) => {
    try {
      const res = await api.getBookingById(bookingId);
      if (res.success) {
        setActivePassBooking(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = bookings.filter(b => b.booking_status === 'CONFIRMED').length;
  const totalSpent = bookings
    .filter(b => b.booking_status === 'CONFIRMED')
    .reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* Top Header */}
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
            My Tickets & Digital Passes
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
            Access your event admission passes, check QR codes, and manage your registrations.
          </p>
        </div>

        {/* User Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Attendee Profile:</span>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Confirmed Tickets
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.35rem' }}>
            {activeCount}
          </div>
          <span style={{ fontSize: '0.785rem', color: '#059669', fontWeight: 600 }}>Active Event Passes</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Tickets Purchased
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            ${totalSpent.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>Across all confirmed events</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cancelled Tickets
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e11d48', marginTop: '0.35rem' }}>
            {bookings.filter(b => b.booking_status === 'CANCELLED').length}
          </div>
          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>Refunded reservations</span>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          backgroundColor: actionNotice.type === 'success' ? '#ecfdf5' : '#fff1f2',
          border: `1px solid ${actionNotice.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
          color: actionNotice.type === 'success' ? '#059669' : '#e11d48',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {actionNotice.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Bookings List */}
      <div>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading your ticket reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4.5rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px dashed #cbd5e1'
          }}>
            <Ticket size={48} color="#94a3b8" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>No Tickets Booked Yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              You don't have any event passes on this account yet. Explore upcoming events to book tickets!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((b) => {
              const isCancelled = b.booking_status === 'CANCELLED';

              return (
                <div
                  key={b.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    opacity: isCancelled ? 0.7 : 1,
                    borderLeft: `5px solid ${isCancelled ? '#e11d48' : '#059669'}`,
                    borderRadius: '16px'
                  }}
                >
                  {/* Event Thumbnail */}
                  <div style={{ width: '200px', flexShrink: 0, overflow: 'hidden' }}>
                    <img
                      src={b.event_banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'}
                      alt={b.event_title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Booking Details */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: '#4f46e5' }}>
                            {b.booking_reference}
                          </span>
                          <span className={`badge ${isCancelled ? 'badge-cancelled' : 'badge-confirmed'}`}>
                            {b.booking_status}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
                          {b.event_title}
                        </h3>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                          ${parseFloat(b.total_amount).toFixed(2)}
                        </span>
                        <div style={{ fontSize: '0.785rem', color: '#64748b' }}>
                          {b.quantity} × ${parseFloat(b.unit_price).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={15} color="#4f46e5" /> {b.event_date} at {b.start_time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={15} color="#0ea5e9" /> {b.venue_name}, {b.venue_city}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Ticket size={15} color="#8b5cf6" /> {b.tier_name || 'General Admission'}
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Booked: {b.booking_date}
                        {b.cancelled_at && ` (Cancelled: ${b.cancelled_at})`}
                      </div>

                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <button
                          onClick={() => handleViewTickets(b.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <QrCode size={15} />
                          <span>View Digital Pass</span>
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(b)}
                            disabled={cancellingId === b.id}
                            className="btn btn-danger btn-sm"
                          >
                            <XCircle size={15} />
                            <span>{cancellingId === b.id ? 'Processing...' : 'Cancel Booking'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      <TicketPassModal
        booking={activePassBooking}
        isOpen={!!activePassBooking}
        onClose={() => setActivePassBooking(null)}
      />
    </div>
  );
}
