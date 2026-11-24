import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, ArrowUpDown, Sparkles, SlidersHorizontal, Flame } from 'lucide-react';
import EventCard from '../components/EventCard';
import { api } from '../services/api';

export default function EventsCatalog({ onBookClick, onSelectEvent, refreshKey }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSort, setSelectedSort] = useState('date_asc');

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, catRes] = await Promise.all([
        api.getEvents({
          category: selectedCategory,
          city: selectedCity,
          search: search,
          sort: selectedSort
        }),
        api.getCategories()
      ]);
      setEvents(eventsRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCity, selectedSort, refreshKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const cities = ['New York', 'Boston', 'San Francisco', 'Chicago', 'Austin'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Premium Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '3.5rem 3rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.3)'
      }}>
        {/* Soft atmospheric gradient orbs */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.28) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-25%',
          left: '25%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.16)'
          }}>
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ color: '#e0e7ff', letterSpacing: '0.02em' }}>Explore Trending Events & Gatherings</span>
          </div>

          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.1rem',
            color: '#ffffff'
          }}>
            Experience Live Moments. <br />
            Reserve Your Passes Instantly.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#c7d2fe',
            lineHeight: 1.6,
            marginBottom: '2.25rem',
            maxWidth: '680px'
          }}>
            Discover premier technology summits, live symphony concerts, startup pitch days, and sports clash passes with real-time seat availability.
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '0.45rem',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            maxWidth: '660px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.9rem', color: '#64748b' }}>
              <Search size={21} />
            </div>
            <input
              type="text"
              placeholder="Search by event title, speaker, city, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: '#0f172a',
                padding: '0.5rem 0.25rem'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}>
              Search Events
            </button>
          </form>
        </div>
      </section>

      {/* Filter Chips & Bar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Category Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.35rem'
        }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '9999px',
              border: selectedCategory === '' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
              backgroundColor: selectedCategory === '' ? '#eef2ff' : '#ffffff',
              color: selectedCategory === '' ? '#4338ca' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.18s ease',
              boxShadow: selectedCategory === '' ? '0 2px 6px rgba(79, 70, 229, 0.15)' : 'none'
            }}
          >
            All Events ({events.length})
          </button>

          {categories.map((c) => {
            const isSelected = selectedCategory === c.slug || selectedCategory === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(isSelected ? '' : c.slug)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9999px',
                  border: isSelected ? `2px solid ${c.badge_color}` : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? `${c.badge_color}18` : '#ffffff',
                  color: isSelected ? c.badge_color : '#475569',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease'
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* City and Sort Dropdowns Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          {/* City filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <MapPin size={17} color="#0ea5e9" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Filter by City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="">All Locations</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ArrowUpDown size={16} color="#6366f1" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="date_asc">Event Date (Upcoming First)</option>
              <option value="popularity">Most Popular (High Demand)</option>
              <option value="price_low">Ticket Price: Low to High</option>
              <option value="price_high">Ticket Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '2rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card" style={{ height: '440px', backgroundColor: '#ffffff', opacity: 0.6 }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4.5rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px dashed #cbd5e1'
          }}>
            <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>No Events Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.4rem', maxWidth: '450px', margin: '0.4rem auto 0' }}>
              We couldn't find events matching your current search or city filters. Try selecting a different category or clearing search filters.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedCity(''); }}
              className="btn btn-secondary"
              style={{ marginTop: '1.5rem' }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
            gap: '2rem'
          }}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onBookClick={onBookClick}
                onSelectEvent={onSelectEvent}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
