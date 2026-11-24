const express = require('express');
const router = express.Router();
const { query, getActiveEngine } = require('../database/db');

// GET /api/dbms/overview - Live DBMS Syllabus Showcase (Units 1-4)
router.get('/overview', async (req, res) => {
  try {
    const engine = getActiveEngine();

    // Unit 2: CTE + Window Function (RANK & Running Revenue)
    const windowMetrics = await query(`
      WITH event_sales AS (
        SELECT
          e.id,
          e.title,
          c.name AS category_name,
          COUNT(b.id) AS total_bookings,
          COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS tickets_sold,
          COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS revenue
        FROM events e
        JOIN categories c ON e.category_id = c.id
        LEFT JOIN bookings b ON e.id = b.event_id
        GROUP BY e.id, e.title, c.name
      )
      SELECT
        *,
        RANK() OVER (ORDER BY revenue DESC) AS revenue_rank,
        SUM(revenue) OVER () AS platform_total_revenue
      FROM event_sales
      ORDER BY revenue_rank ASC
    `);

    // Unit 1 & 2: Star Schema Fact-Dimension View
    const starFactRows = await query(`SELECT * FROM v_fact_bookings_star ORDER BY booking_date DESC LIMIT 10`);

    // Unit 3: Trigger-generated Audit Logs
    const auditLogs = await query(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10`);

    // Unit 4: Live Query Execution Plan (B-Tree Index verification)
    const explainSql = engine === 'mysql'
      ? `EXPLAIN SELECT id, title, event_date FROM events WHERE status = 'UPCOMING' ORDER BY event_date`
      : `EXPLAIN QUERY PLAN SELECT id, title, event_date FROM events WHERE status = 'UPCOMING' ORDER BY event_date`;
    const executionPlan = await query(explainSql);

    // Unit 4: NoSQL Document Store Comparison (Denormalized JSON Document)
    const nosqlDocument = starFactRows.length > 0 ? {
      _collection: 'bookings_nosql',
      _id: starFactRows[0].booking_reference,
      bookingStatus: starFactRows[0].booking_status,
      quantity: starFactRows[0].quantity,
      totalAmount: starFactRows[0].total_amount,
      event: {
        id: starFactRows[0].event_id,
        title: starFactRows[0].event_title,
        category: starFactRows[0].category_name
      },
      venue: {
        name: starFactRows[0].venue_name,
        city: starFactRows[0].venue_city
      },
      attendee: starFactRows[0].attendee_name
    } : null;

    res.json({
      success: true,
      engine: engine === 'mysql' ? 'MySQL 8.0' : 'SQLite 3',
      units: {
        unit1_design: {
          title: 'Unit 1: Database Design & Relational Model',
          normal_form: '3NF / BCNF (7 normalized tables + audit_logs)',
          star_schema_view: 'v_fact_bookings_star',
          star_rows: starFactRows
        },
        unit2_sql: {
          title: 'Unit 2: SQL Queries, CTEs & Window Functions',
          window_metrics: windowMetrics
        },
        unit3_transactions: {
          title: 'Unit 3: ACID Transactions, Triggers & Security',
          acid_mode: 'BEGIN IMMEDIATE / COMMIT / ROLLBACK on bookings & cancellations',
          security: 'Parameterized queries (?) + CHECK constraints + Trigger auditing',
          audit_logs: auditLogs
        },
        unit4_performance_nosql: {
          title: 'Unit 4: Query Optimization (EXPLAIN) & NoSQL Comparison',
          execution_plan: executionPlan,
          nosql_document: nosqlDocument
        }
      }
    });
  } catch (err) {
    console.error('Error in DBMS overview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
