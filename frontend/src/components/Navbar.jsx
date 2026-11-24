import React from 'react';
import { Calendar, Ticket, LayoutDashboard, PlusCircle, User, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, users = [], onOpenCreateModal }) {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
        gap: '1.25rem'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('events')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.28)'
          }}>
            <Calendar size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{
                fontWeight: 800,
                fontSize: '1.3rem',
                letterSpacing: '-0.03em',
                color: '#0f172a'
              }}>
                Event<span style={{ color: '#4f46e5' }}>Sphere</span>
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
              Ticketing & Event Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#f8fafc',
          padding: '0.35rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'events' ? '#ffffff' : 'transparent',
              color: activeTab === 'events' ? '#4f46e5' : '#475569',
              fontWeight: activeTab === 'events' ? 700 : 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'events' ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none'
            }}
          >
            <Calendar size={17} strokeWidth={activeTab === 'events' ? 2.3 : 1.8} />
            <span>Discover Events</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'bookings' ? '#ffffff' : 'transparent',
              color: activeTab === 'bookings' ? '#4f46e5' : '#475569',
              fontWeight: activeTab === 'bookings' ? 700 : 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'bookings' ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none'
            }}
          >
            <Ticket size={17} strokeWidth={activeTab === 'bookings' ? 2.3 : 1.8} />
            <span>My Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'dashboard' ? '#ffffff' : 'transparent',
              color: activeTab === 'dashboard' ? '#4f46e5' : '#475569',
              fontWeight: activeTab === 'dashboard' ? 700 : 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'dashboard' ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none'
            }}
          >
            <LayoutDashboard size={17} strokeWidth={activeTab === 'dashboard' ? 2.3 : 1.8} />
            <span>Organizer Hub</span>
          </button>
        </nav>

        {/* User Account Profile & Host Event */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            padding: '0.4rem 0.85rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={15} />
            </div>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                const found = users.find(u => u.id === parseInt(e.target.value));
                if (found) setCurrentUser(found);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
                paddingRight: '0.5rem'
              }}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'organizer' ? 'Host' : 'Attendee'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <PlusCircle size={17} />
            <span>Host Event</span>
          </button>
        </div>
      </div>
    </header>
  );
}
