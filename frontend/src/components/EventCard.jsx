import React from 'react';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

export default function EventCard({ event, onBookClick, onSelectEvent }) {
  const isSoldOut = event.remaining_seats <= 0;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '18px' }}>
      {/* Banner */}
      <div 
        onClick={() => onSelectEvent(event)}
        style={{
          position: 'relative',
          height: '210px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />
        
        {/* Category Pill */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          backgroundColor: event.badge_color || '#4f46e5',
          color: '#ffffff',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          letterSpacing: '0.02em'
        }}>
          {event.category_name}
        </div>

        {/* Status Pill */}
        <div style={{
          position: 'absolute',
          top: '14px',
          right: '14px'
        }}>
          <span className={`badge badge-${event.status.toLowerCase()}`}>
            {event.status}
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '14px',
          right: '14px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          padding: '0.35rem 0.85rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          fontWeight: 800,
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          ${parseFloat(event.base_price).toFixed(2)}
          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8' }}> / seat</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.85rem' }}>
        <h3 
          onClick={() => onSelectEvent(event)}
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            lineHeight: 1.4,
            cursor: 'pointer',
            color: '#0f172a',
            letterSpacing: '-0.02em'
          }}
        >
          {event.title}
        </h3>

        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </p>

        {/* Date & Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Calendar size={15} color="#4f46e5" strokeWidth={2} />
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{event.event_date}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <Clock size={14} color="#64748b" />
            <span>{event.start_time}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <MapPin size={15} color="#0ea5e9" strokeWidth={2} />
            <span style={{ fontWeight: 500, color: '#475569' }}>{event.venue_name}, {event.venue_city}</span>
          </div>
        </div>

        {/* Real-Time Availability Tracker */}
        <div style={{ marginTop: 'auto', paddingTop: '0.4rem' }}>
          <AvailabilityBadge
            totalSeats={event.total_seats}
            bookedSeats={event.booked_seats}
            remainingSeats={event.remaining_seats}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => onSelectEvent(event)}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: '0.825rem', padding: '0.65rem' }}
          >
            Details
          </button>
          
          <button
            onClick={() => onBookClick(event)}
            disabled={isSoldOut}
            className={`btn ${isSoldOut ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              flex: 1.6,
              fontSize: '0.825rem',
              padding: '0.65rem',
              opacity: isSoldOut ? 0.6 : 1,
              cursor: isSoldOut ? 'not-allowed' : 'pointer'
            }}
          >
            <Ticket size={16} />
            {isSoldOut ? 'Sold Out' : 'Book Tickets'}
          </button>
        </div>
      </div>
    </div>
  );
}
