import React, { useState } from 'react';
import { Shield, UserPlus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
};

export default function SuperAdminConsole({ users = [], onUserCreated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'attendee' });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await api.createUser(form);
      if (res.success) {
        setNotice({ type: 'success', text: `Created ${form.role} account for ${form.name} (${form.email}).` });
        setForm({ name: '', email: '', phone: '', role: 'attendee' });
        if (onUserCreated) onUserCreated(res.data);
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem' }}>
          <Shield size={16} />
          <span>SUPER ADMIN GOVERNANCE</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0' }}>
          User Provisioning & Role Directory
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Create test Attendee, Host (Organizer), or Admin accounts and switch into them from the top bar.
        </p>
      </div>

      {notice && (
        <div style={{
          padding: '0.9rem 1.15rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: notice.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: notice.type === 'success' ? '#047857' : '#b91c1c',
          border: `1px solid ${notice.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          {notice.type === 'success' ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
          <span>{notice.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Create User Form */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            <UserPlus size={18} color="#4f46e5" />
            <span>Create New User</span>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. alex@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Phone</label>
              <input
                type="text"
                placeholder="+1-555-0199"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input-field"
              >
                <option value="attendee">Attendee (Discover & Book 1 Ticket/Event)</option>
                <option value="organizer">Host / Organizer (Create & Manage Events)</option>
                <option value="admin">Super Admin (Full Platform Access)</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '0.25rem', justifyContent: 'center' }}>
              <UserPlus size={16} />
              <span>{submitting ? 'Creating...' : 'Create User Account'}</span>
            </button>
          </form>
        </div>

        {/* Users Directory */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a' }}>
              <Users size={18} color="#0284c7" />
              <span>Platform Users ({users.length})</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="dbms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                    <td style={{ color: '#475569', fontSize: '0.82rem' }}>{u.email}</td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{u.phone || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        backgroundColor: u.role === 'admin' ? '#f3e8ff' : u.role === 'organizer' ? '#eef2ff' : '#ecfdf5',
                        color: u.role === 'admin' ? '#7c3aed' : u.role === 'organizer' ? '#4f46e5' : '#047857'
                      }}>
                        {u.role === 'organizer' ? 'Host' : u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
