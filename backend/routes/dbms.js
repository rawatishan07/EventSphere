const express = require('express');
const router = express.Router();
const { query } = require('../database/db');

// GET /api/dbms/overview - Live DBMS Syllabus Showcase (Units 1-4)
router.get('/overview', async (req, res) => {
  try {
    // Unit 1 & 2: Star Schema View
    const starRows = await query('SELECT * FROM v_fact_bookings_star ORDER BY booking_date DESC LIMIT 10');

    // Unit 2: CTE + Window Functions (RANK & Running Sum)
    const windowMetrics = await query(`
      WITH event_sales AS (
        SELECT
          e.id, e.title, c.name AS category_name,
          COUNT(b.id) AS total_bookings,
          COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS tickets_sold,
          COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS revenue
        FROM events e
        JOIN categories c ON e.category_id = c.id
        LEFT JOIN bookings b ON e.id = b.event_id
        GROUP BY e.id, e.title, c.name
      )
      SELECT *, RANK() OVER (ORDER BY revenue DESC) AS revenue_rank, SUM(revenue) OVER () AS platform_total_revenue
      FROM event_sales
      ORDER BY revenue_rank ASC
    `);

    // Unit 3: SQL Trigger Audit Logs
    const auditLogs = await query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10');

    // Unit 4: Execution Plan (B-Tree Index verification)
    const executionPlan = await query(
      "EXPLAIN QUERY PLAN SELECT id, title, event_date FROM events WHERE status = 'UPCOMING' ORDER BY event_date"
    );

    // Unit 4: NoSQL Document equivalent (JSON)
    const nosqlDocument = starRows[0] ? {
      _collection: 'bookings_nosql',
      _id: starRows[0].booking_reference,
      bookingStatus: starRows[0].booking_status,
      quantity: starRows[0].quantity,
      totalAmount: starRows[0].total_amount,
      event: { id: starRows[0].event_id, title: starRows[0].event_title, category: starRows[0].category_name },
      venue: { name: starRows[0].venue_name, city: starRows[0].venue_city },
      attendee: starRows[0].attendee_name
    } : null;

    res.json({
      success: true,
      engine: 'SQLite 3',
      units: {
        unit1_design: {
          title: 'Unit 1: Database Design & Relational Model',
          normal_form: '3NF / BCNF (7 normalized tables + audit_logs)',
          star_schema_view: 'v_fact_bookings_star',
          star_rows: starRows
        },
        unit2_sql: {
          title: 'Unit 2: SQL Queries, CTEs & Window Functions',
          window_metrics: windowMetrics
        },
        unit3_transactions: {
          title: 'Unit 3: ACID Transactions, Triggers & Security',
          acid_mode: 'BEGIN TRANSACTION / COMMIT / ROLLBACK on bookings & events',
          security: 'Parameterized queries (?) + CHECK constraints + RBAC + SQL Triggers',
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
