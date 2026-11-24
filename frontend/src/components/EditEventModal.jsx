import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function EditEventModal({ event, isOpen, onClose, onEventUpdated, categories = [], venues = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    event_date: '',
    start_time: '',
    end_time: '',
    banner_url: '',
    total_seats: 100,
    base_price: 50,
    status: 'UPCOMING'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category_id: event.category_id || '',
        venue_id: event.venue_id || '',
        event_date: event.event_date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        banner_url: event.banner_url || '',
        total_seats: event.total_seats || 100,
        base_price: event.base_price || 50,
        status: event.status || 'UPCOMING'
      });
      setErrorMsg('');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        venue_id: parseInt(formData.venue_id),
        total_seats: parseInt(formData.total_seats),
        base_price: parseFloat(formData.base_price)
      };

      const res = await api.updateEvent(event.id, payload);
      if (res.success) {
        onEventUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
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
              Edit Event
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Update event details, timing, and capacity</p>
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
            fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
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
              <label className="form-label">Venue</label>
              <select
                className="form-select"
                value={formData.venue_id}
                onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Event Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Total Seats</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.total_seats}
                onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Base Ticket Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 2, padding: '0.75rem' }}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
