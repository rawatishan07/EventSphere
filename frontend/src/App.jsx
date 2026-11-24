import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventsCatalog from './pages/EventsCatalog';
import MyBookings from './pages/MyBookings';
import OrganizerDashboard from './pages/OrganizerDashboard';
import DbmsShowcase from './pages/DbmsShowcase';

import EventBookingModal from './components/EventBookingModal';
import TicketPassModal from './components/TicketPassModal';
import EventDetailModal from './components/EventDetailModal';
import CreateEventModal from './components/CreateEventModal';

import { api } from './services/api';
import './styles/index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'bookings' | 'dashboard'
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [bookingEvent, setBookingEvent] = useState(null);
  const [ticketPassBooking, setTicketPassBooking] = useState(null);
  const [detailEventId, setDetailEventId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Initial global data loading
  useEffect(() => {
    async function init() {
      try {
        const [usersRes, catRes, venuesRes] = await Promise.all([
          api.getUsers(),
          api.getCategories(),
          api.getVenues()
        ]);

        const uList = usersRes.data || [];
        setUsers(uList);
        if (uList.length > 0) {
          // Default to Sarah Jenkins (attendee id 4) or first user
          const defaultUser = uList.find(u => u.name.includes('Sarah')) || uList[0];
          setCurrentUser(defaultUser);
        }

        setCategories(catRes.data || []);
        setVenues(venuesRes.data || []);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  const handleBookingSuccess = (booking) => {
    setTicketPassBooking(booking);
    setRefreshKey(prev => prev + 1);
  };

  const handleEventCreated = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('events');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        {activeTab === 'events' && (
          <EventsCatalog
            onBookClick={(event) => setBookingEvent(event)}
            onSelectEvent={(event) => setDetailEventId(event.id)}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'bookings' && (
          <MyBookings
            currentUser={currentUser}
            users={users}
            onOpenBookingPass={(booking) => setTicketPassBooking(booking)}
          />
        )}

        {activeTab === 'dashboard' && (
          <OrganizerDashboard
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            categories={categories}
            venues={venues}
          />
        )}

        {activeTab === 'dbms' && <DbmsShowcase />}
      </main>

      {/* Modals */}
      <EventBookingModal
        event={bookingEvent}
        isOpen={!!bookingEvent}
        onClose={() => setBookingEvent(null)}
        onBookingSuccess={handleBookingSuccess}
        currentUser={currentUser}
        users={users}
      />

      <TicketPassModal
        booking={ticketPassBooking}
        isOpen={!!ticketPassBooking}
        onClose={() => setTicketPassBooking(null)}
      />

      <EventDetailModal
        eventId={detailEventId}
        isOpen={!!detailEventId}
        onClose={() => setDetailEventId(null)}
        onBookClick={(event) => setBookingEvent(event)}
      />

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
        categories={categories}
        venues={venues}
        currentUser={currentUser}
      />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '2.5rem 0 2rem',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>EventSphere</span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#64748b' }}>Live Event & Ticket Booking System</span>
            </div>
            <p style={{ fontSize: '0.785rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Instant confirmations, seat tracking, and seamless pass management.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', fontWeight: 600, fontSize: '0.85rem' }}>
            <span style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ● Instant Pass Issuance
            </span>
            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ● Live Seat Availability
            </span>
            <span style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ● Hassle-Free Cancellations
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
