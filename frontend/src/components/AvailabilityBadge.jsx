import React from 'react';
import { Users } from 'lucide-react';

export default function AvailabilityBadge({ totalSeats, bookedSeats, remainingSeats, compact = false }) {
  const total = parseInt(totalSeats, 10) || 1;
  const booked = parseInt(bookedSeats, 10) || 0;
  const remaining = Math.max(0, parseInt(remainingSeats, 10) ?? (total - booked));
  const occupancyPct = Math.min(100, Math.round((booked / total) * 100));

  const isSoldOut = remaining <= 0;
  const isSellingFast = !isSoldOut && (remaining / total) <= 0.2;

  let barColor = '#059669'; // Emerald
  if (isSoldOut) barColor = '#e11d48'; // Rose
  else if (isSellingFast) barColor = '#d97706'; // Amber

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {isSoldOut ? (
          <span style={{
            backgroundColor: '#fff1f2',
            color: '#e11d48',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.725rem',
            fontWeight: 700
          }}>
            Sold Out
          </span>
        ) : isSellingFast ? (
          <span style={{
            backgroundColor: '#fffbeb',
            color: '#b45309',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.725rem',
            fontWeight: 700
          }}>
            Only {remaining} left
          </span>
        ) : (
          <span style={{
            backgroundColor: '#ecfdf5',
            color: '#059669',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.725rem',
            fontWeight: 600
          }}>
            {remaining} / {total} seats
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '0.85rem 1.15rem',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>
          <Users size={15} color="#4f46e5" />
          <span>Seat Availability</span>
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSoldOut ? '#e11d48' : '#0f172a' }}>
          {isSoldOut ? 'SOLD OUT' : `${remaining} of ${total} available`}
        </div>
      </div>

      {/* Progress Track */}
      <div className="progress-bar-bg" style={{ height: '6px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${occupancyPct}%`,
            backgroundColor: barColor
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
        <span>{booked} seats booked ({occupancyPct}% full)</span>
        {isSellingFast && !isSoldOut && (
          <span style={{ color: '#d97706', fontWeight: 700 }}>⚡ High Demand</span>
        )}
      </div>
    </div>
  );
}
