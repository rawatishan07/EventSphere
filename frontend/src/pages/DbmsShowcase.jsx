import React, { useEffect, useState } from 'react';
import { Database, Layers, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
};

const codeBoxStyle = {
  backgroundColor: '#0f172a',
  color: '#e2e8f0',
  padding: '0.85rem 1rem',
  borderRadius: '10px',
  fontSize: '0.78rem',
  overflowX: 'auto',
  marginTop: '0.75rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
};

export default function DbmsShowcase() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDbmsOverview();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading live DBMS analytics...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: '#dc2626' }}>Error: {error}</div>;
  }

  const { units, engine } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            DBMS Architecture & Live SQL Lab
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Active Engine: <strong>{engine}</strong> · Live queries mapped to Units 1–4
          </p>
        </div>
        <button onClick={load} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={15} />
          <span>Refresh Live Queries</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Unit 1 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 700 }}>
            <Database size={18} />
            <span>{units.unit1_design.title}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
            <strong>Relational Schema:</strong> {units.unit1_design.normal_form}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
            <strong>Star Schema View:</strong> <code>{units.unit1_design.star_schema_view}</code> ({units.unit1_design.star_rows.length} fact row(s))
          </p>
          <pre style={codeBoxStyle}>
            {JSON.stringify(units.unit1_design.star_rows[0] || {}, null, 2)}
          </pre>
        </div>

        {/* Unit 2 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 700 }}>
            <Layers size={18} />
            <span>{units.unit2_sql.title}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
            Live <code>WITH</code> CTE + <code>RANK() OVER</code> & <code>SUM() OVER</code> window functions:
          </p>
          <pre style={codeBoxStyle}>
            {JSON.stringify(units.unit2_sql.window_metrics, null, 2)}
          </pre>
        </div>

        {/* Unit 3 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 700 }}>
            <ShieldCheck size={18} />
            <span>{units.unit3_transactions.title}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
            <strong>ACID:</strong> {units.unit3_transactions.acid_mode}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
            <strong>Security:</strong> {units.unit3_transactions.security}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
            Recent SQL Trigger Audit Logs (<code>trg_booking_audit_*</code>):
          </p>
          <pre style={codeBoxStyle}>
            {JSON.stringify(units.unit3_transactions.audit_logs, null, 2)}
          </pre>
        </div>

        {/* Unit 4 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontWeight: 700 }}>
            <Zap size={18} />
            <span>{units.unit4_performance_nosql.title}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
            <strong>B-Tree Index Plan (<code>EXPLAIN QUERY PLAN</code>):</strong>
          </p>
          <pre style={codeBoxStyle}>
            {JSON.stringify(units.unit4_performance_nosql.execution_plan, null, 2)}
          </pre>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.75rem' }}>
            <strong>NoSQL Document Store Equivalent (MongoDB/Firebase):</strong>
          </p>
          <pre style={codeBoxStyle}>
            {JSON.stringify(units.unit4_performance_nosql.nosql_document, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
