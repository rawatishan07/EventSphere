import React from 'react';
import { X, CheckCircle, QrCode, Calendar, MapPin, Download, Ticket } from 'lucide-react';

export default function TicketPassModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)'
            }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Reservation Confirmed!</h2>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Booking Ref: <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>{booking.booking_reference}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              cursor: 'pointer',
              color: '#cbd5e1',
              padding: '0.45rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            border: '2px dashed #c7d2fe',
            borderRadius: '18px',
            padding: '1.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.15rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Official Event Admission Pass
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
                  {booking.event_title || 'EventSphere Confirmed Entry'}
                </h3>
              </div>
              <span className="badge badge-confirmed">CONFIRMED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.15rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Attendee</span>
                <p style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{booking.user_name || 'Registered Attendee'}</p>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Tickets</span>
                <p style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{booking.quantity} Seat(s) Reserved</p>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Paid</span>
                <p style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.1rem', marginTop: '0.15rem' }}>
                  ${parseFloat(booking.total_amount).toFixed(2)}
                </p>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Payment Status</span>
                <p style={{ fontWeight: 700, color: '#059669', marginTop: '0.15rem' }}>Completed</p>
              </div>
            </div>
          </div>

          {/* Individual Issued Tickets with Barcodes */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Ticket size={16} color="#4f46e5" />
              <span>Digital Passes ({booking.tickets?.length || booking.quantity})</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
              {(booking.tickets && booking.tickets.length > 0 ? booking.tickets : [
                { ticket_code: 'TKT-AUTO-GEN', seat_label: 'GEN-01', status: 'VALID' }
              ]).map((t, idx) => (
                <div
                  key={t.ticket_code || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.95rem 1.15rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      backgroundColor: '#f1f5f9',
                      padding: '0.55rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <QrCode size={22} color="#0f172a" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.925rem', color: '#0f172a' }}>
                          {t.ticket_code}
                        </span>
                        <span style={{
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.725rem',
                          fontWeight: 700
                        }}>
                          Seat {t.seat_label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 600, display: 'block', marginTop: '0.2rem' }}>
                        ● Active Pass (Ready for Entry)
                      </span>
                    </div>
                  </div>

                  {/* Simulated Barcode */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '3px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                      height: '26px',
                      alignItems: 'center'
                    }}>
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1].map((w, i) => (
                        <div key={i} style={{ width: `${w}px`, height: '100%', backgroundColor: '#0f172a' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: '#94a3b8' }}>SCAN READY</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.785rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
            Present this digital pass or ticket reference at the check-in desk upon arrival.
          </p>

          {/* Action */}
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.8rem' }}
            >
              <Download size={16} />
              <span>Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.8rem' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
