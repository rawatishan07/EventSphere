import React, { useState, useEffect } from 'react';
import { X, Ticket, Calendar, MapPin, Users, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function EventBookingModal({ event, isOpen, onClose, onBookingSuccess, currentUser, users = [] }) {
  const [selectedUser, setSelectedUser] = useState(currentUser?.id || 4);
  const [ticketTiers, setTicketTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      setSelectedUser(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && event?.id) {
      setErrorMsg('');
      setQuantity(1);
      setLoadingTiers(true);
      api.getEventById(event.id)
        .then((res) => {
          const tiers = res.data?.ticket_tiers || [];
          setTicketTiers(tiers);
          if (tiers.length > 0) {
            const availableTier = tiers.find(t => t.remaining_count > 0) || tiers[0];
            setSelectedTierId(availableTier.id);
          } else {
            setSelectedTierId('');
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorMsg('Failed to load ticket tiers.');
        })
        .finally(() => setLoadingTiers(false));
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const currentTier = ticketTiers.find(t => t.id === parseInt(selectedTierId)) || null;
  const unitPrice = currentTier ? currentTier.price : event.base_price;
  const maxAvailable = currentTier 
    ? Math.min(currentTier.remaining_count, event.remaining_seats)
    : event.remaining_seats;

  const totalAmount = (unitPrice * quantity).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (quantity > maxAvailable) {
      setErrorMsg(`Only ${maxAvailable} ticket(s) currently available.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: parseInt(selectedUser),
        event_id: event.id,
        ticket_tier_id: selectedTierId ? parseInt(selectedTierId) : null,
        quantity: parseInt(quantity),
        notes
      };

      const res = await api.bookTickets(payload);
      if (res.success) {
        onBookingSuccess(res.booking);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Booking reservation could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              padding: '0.6rem',
              borderRadius: '12px'
            }}>
              <Ticket size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Reserve Your Tickets
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Select ticket tier & attendee pass details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.45rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Event Quick Overview */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}>
            {event.title}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8125rem', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="#4f46e5" /> {event.event_date} at {event.start_time}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="#0ea5e9" /> {event.venue_name}, {event.venue_city}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 600 }}>
              <Users size={14} /> {event.remaining_seats} seats left
            </span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div style={{
            margin: '1.25rem 1.75rem 0',
            padding: '0.85rem 1rem',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            color: '#e11d48',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Attendee selector */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Attendee Name</label>
            <select
              className="form-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Tier Selection */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Choose Ticket Tier</label>
            {loadingTiers ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading pricing tiers...</p>
            ) : ticketTiers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ticketTiers.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const isTierSoldOut = tier.remaining_count <= 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isTierSoldOut && setSelectedTierId(tier.id)}
                      style={{
                        padding: '0.9rem 1.1rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f5f7ff' : '#ffffff',
                        cursor: isTierSoldOut ? 'not-allowed' : 'pointer',
                        opacity: isTierSoldOut ? 0.45 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {tier.tier_name}
                          </span>
                          {tier.remaining_count <= 10 && !isTierSoldOut && (
                            <span style={{ fontSize: '0.7rem', backgroundColor: '#fffbeb', color: '#b45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                              Only {tier.remaining_count} left
                            </span>
                          )}
                          {isTierSoldOut && (
                            <span style={{ fontSize: '0.7rem', backgroundColor: '#fff1f2', color: '#e11d48', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                              Sold Out
                            </span>
                          )}
                        </div>
                        {tier.perks && (
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                            {tier.perks}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4f46e5' }}>
                          ${parseFloat(tier.price).toFixed(2)}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {tier.remaining_count} remaining
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 600 }}>General Admission</span>
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>${parseFloat(event.base_price).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Quantity selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.15rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>Select Quantity</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Max {Math.min(10, maxAvailable)} tickets per booking</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="btn btn-secondary btn-sm"
                style={{ width: '34px', height: '34px', padding: 0, borderRadius: '8px' }}
              >
                -
              </button>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', minWidth: '26px', textAlign: 'center', color: '#0f172a' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(Math.min(10, maxAvailable), quantity + 1))}
                disabled={quantity >= maxAvailable || quantity >= 10}
                className="btn btn-secondary btn-sm"
                style={{ width: '34px', height: '34px', padding: 0, borderRadius: '8px' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Special Requests (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Accessibility seating or dietary preferences"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Total calculation */}
          <div style={{
            padding: '1.1rem 1.25rem',
            backgroundColor: '#eef2ff',
            borderRadius: '12px',
            border: '1px solid #c7d2fe',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Amount Due
              </span>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                {quantity} ticket(s) × ${parseFloat(unitPrice).toFixed(2)}
              </p>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e1b4b' }}>
              ${totalAmount}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || maxAvailable <= 0}
              className="btn btn-primary"
              style={{ flex: 2, padding: '0.75rem' }}
            >
              {submitting ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
