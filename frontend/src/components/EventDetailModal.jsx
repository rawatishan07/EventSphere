import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Ticket, ShieldCheck, Mail, Phone, Info } from 'lucide-react';
import { api } from '../services/api';
import AvailabilityBadge from '../components/AvailabilityBadge';

export default function EventDetailModal({ eventId, isOpen, onClose, onBookClick }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      api.getEventById(eventId)
        .then((res) => setEvent(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {loading || !event ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading event details...
          </div>
        ) : (
          <div>
            {/* Banner Header */}
            <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
              <img
                src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <X size={20} />
              </button>

              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                backgroundColor: event.badge_color || '#4f46e5',
                color: '#ffffff',
                padding: '0.35rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
              }}>
                {event.category_name}
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, letterSpacing: '-0.025em' }}>
                  {event.title}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: '#475569' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={16} color="#4f46e5" /> {event.event_date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={16} color="#4f46e5" /> {event.start_time} - {event.end_time || 'Late'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={16} color="#0ea5e9" /> {event.venue_name}, {event.venue_city}
                  </span>
                </div>
              </div>

              {/* Real-Time Availability Widget */}
              <AvailabilityBadge
                totalSeats={event.total_seats}
                bookedSeats={event.booked_seats}
                remainingSeats={event.remaining_seats}
              />

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  About the Experience
                </h4>
                <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.65 }}>
                  {event.description}
                </p>
              </div>

              {/* Ticket Pricing Tiers */}
              {event.ticket_tiers && event.ticket_tiers.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Ticket size={17} color="#4f46e5" />
                    <span>Ticket Options & Pass Tiers</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {event.ticket_tiers.map((tier) => (
                      <div
                        key={tier.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem 1.25rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {tier.tier_name}
                          </div>
                          {tier.perks && (
                            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                              {tier.perks}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                            ${parseFloat(tier.price).toFixed(2)}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {tier.remaining_count} / {tier.total_allocation} available
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Venue & Organizer Details Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.25rem',
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <h5 style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    Venue Details
                  </h5>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{event.venue_name}</p>
                  <p style={{ fontSize: '0.825rem', color: '#64748b' }}>{event.venue_address}</p>
                  {event.venue_amenities && (
                    <p style={{ fontSize: '0.785rem', color: '#0284c7', marginTop: '0.45rem' }}>
                      ✨ {event.venue_amenities}
                    </p>
                  )}
                </div>

                <div>
                  <h5 style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    Event Host / Organizer
                  </h5>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{event.organizer_name}</p>
                  <p style={{ fontSize: '0.825rem', color: '#64748b' }}>{event.organizer_email}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '0.85rem' }}>
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onBookClick(event);
                  }}
                  disabled={event.remaining_seats <= 0}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.85rem' }}
                >
                  <Ticket size={18} />
                  <span>{event.remaining_seats <= 0 ? 'Sold Out' : 'Book Tickets Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
