import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Layers, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function CreateEventModal({ isOpen, onClose, onEventCreated, categories = [], venues = [], currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    organizer_id: currentUser?.id || 1,
    event_date: '',
    start_time: '10:00',
    end_time: '17:00',
    banner_url: '',
    total_seats: 200,
    base_price: 49.99
  });

  const [tiers, setTiers] = useState([
    { tier_name: 'General Admission', price: 49.99, total_allocation: 150, perks: 'Standard access' },
    { tier_name: 'VIP Pass', price: 99.99, total_allocation: 50, perks: 'Front-row seating & drink voucher' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
    if (venues.length > 0 && !formData.venue_id) {
      setFormData(prev => ({ ...prev, venue_id: venues[0].id }));
    }
  }, [categories, venues]);

  if (!isOpen) return null;

  const selectedVenue = venues.find(v => v.id === parseInt(formData.venue_id)) || null;

  const handleAddTier = () => {
    setTiers([...tiers, { tier_name: 'Tier ' + (tiers.length + 1), price: formData.base_price, total_allocation: 50, perks: '' }]);
  };

  const handleRemoveTier = (index) => {
    setTiers(tiers.filter((_, idx) => idx !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index][field] = value;
    setTiers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title || !formData.description || !formData.event_date || !formData.start_time) {
      setErrorMsg('Please fill in all required event details.');
      return;
    }

    if (selectedVenue && parseInt(formData.total_seats) > selectedVenue.capacity) {
      setErrorMsg(`Total seats (${formData.total_seats}) cannot exceed venue maximum capacity (${selectedVenue.capacity}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        venue_id: parseInt(formData.venue_id),
        organizer_id: currentUser?.id || 1,
        total_seats: parseInt(formData.total_seats),
        base_price: parseFloat(formData.base_price),
        ticket_tiers: tiers
      };

      const res = await api.createEvent(payload);
      if (res.success) {
        onEventCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Host a New Event
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Configure event schedule, venue, and ticketing tiers</p>
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
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Title */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Next-Gen Cloud Architecture Summit"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe what attendees will experience, keynotes, workshops, and networking..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Category & Venue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Venue Location *</label>
              <select
                className="form-select"
                value={formData.venue_id}
                onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city} - Max {v.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Event Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="form-input"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Total Seats & Base Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Total Seats Available *</label>
              <input
                type="number"
                min="1"
                max={selectedVenue?.capacity || 5000}
                className="form-input"
                required
                value={formData.total_seats}
                onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
              />
              {selectedVenue && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Venue maximum: {selectedVenue.capacity} seats
                </span>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Base Ticket Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                required
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              />
            </div>
          </div>

          {/* Banner URL */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Banner Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={formData.banner_url}
              onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
            />
          </div>

          {/* Ticket Tiers Section */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                Pricing Tiers ({tiers.length})
              </span>
              <button
                type="button"
                onClick={handleAddTier}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} /> Add Tier
              </button>
            </div>

            {tiers.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 2fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <input
                  type="text"
                  placeholder="Tier Name"
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                  value={t.tier_name}
                  onChange={(e) => handleTierChange(idx, 'tier_name', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                  value={t.price}
                  onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Seats"
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                  value={t.total_allocation}
                  onChange={(e) => handleTierChange(idx, 'total_allocation', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Perks"
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                  value={t.perks}
                  onChange={(e) => handleTierChange(idx, 'perks', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTier(idx)}
                  disabled={tiers.length <= 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: tiers.length > 1 ? '#e11d48' : '#cbd5e1',
                    cursor: tiers.length > 1 ? 'pointer' : 'not-allowed',
                    padding: '0.4rem'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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
              disabled={submitting}
              className="btn btn-primary"
              style={{ flex: 2, padding: '0.75rem' }}
            >
              {submitting ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
