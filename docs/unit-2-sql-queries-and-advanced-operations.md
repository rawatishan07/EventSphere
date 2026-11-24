# Unit 2: SQL Queries & Advanced Operations (Applied to EventSphere)

> **Syllabus Coverage:** SQL Fundamentals (DDL, DML, DCL, TCL) · Complex Queries (Inner/Left Joins, Correlated Subqueries, Set Operations) · Views & Indexing · Window Functions & Common Table Expressions (CTEs).

---

## 1. SQL Command Categories in EventSphere
| Category | Commands | Where Used in EventSphere |
| :--- | :--- | :--- |
| **DDL** (Data Definition) | `CREATE TABLE`, `CREATE INDEX`, `CREATE VIEW`, `CREATE TRIGGER` | `backend/database/schema_sqlite.sql` |
| **DML** (Data Manipulation) | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `routes/events.js`, `routes/bookings.js`, `routes/users.js` |
| **TCL** (Transaction Control) | `BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK` | `routes/bookings.js` & `routes/events.js` |
| **DCL** (Data Control) | `GRANT` / `REVOKE` (MySQL) · RBAC Middleware (App layer) | `backend/middleware/rbac.js` (`requireRole`) |

---

## 2. Complex Joins & Subqueries Used in Production Routes
1. **Multi-Table `INNER JOIN` + `LEFT JOIN` (`routes/events.js`):**
   - Joins `events` with `categories`, `venues`, and `users` (`INNER JOIN` — every event must have all three), and `LEFT JOIN bookings` so events with **0 bookings** still appear with `booked_seats = 0`.
   - Live seat calculation:
     ```sql
     COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS booked_seats
     ```
2. **Correlated Subqueries (`routes/bookings.js`):**
   - Counts valid tickets and aggregates ticket codes per booking without multiplying booking rows:
     ```sql
     (SELECT COUNT(*) FROM tickets t WHERE t.booking_id = b.id AND t.status = 'VALID') AS valid_ticket_count,
     (SELECT GROUP_CONCAT(t.ticket_code) FROM tickets t WHERE t.booking_id = b.id) AS ticket_codes
     ```

---

## 3. Views & Indexes (`schema_sqlite.sql`)
- **View (`v_fact_bookings_star`):** Pre-joins `bookings` with `events`, `categories`, `venues`, and `users` for clean Star Schema reporting in `/api/dbms/overview`.
- **8 B-Tree Indexes:**
  - `idx_events_date`, `idx_events_category`, `idx_events_venue`, `idx_events_status`
  - `idx_bookings_user`, `idx_bookings_event`, `idx_bookings_status`
  - `idx_tickets_code`
  - **Why index Foreign Keys & filter columns?** Every `WHERE`, `JOIN ON`, and `ORDER BY` on `events.status` or `bookings.user_id` avoids full table scans (`SCAN`) and uses `SEARCH ... USING INDEX`.

---

## 4. Common Table Expressions (CTEs) & Window Functions (`routes/dbms.js`)
In `GET /api/dbms/overview`, EventSphere executes a live CTE + Window Function query:
```sql
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
SELECT
  *,
  RANK() OVER (ORDER BY revenue DESC) AS revenue_rank,
  SUM(revenue) OVER () AS platform_total_revenue
FROM event_sales
ORDER BY revenue_rank ASC;
```
- **Why CTE (`WITH`)?** Separates the aggregation step (`event_sales`) from ranking, making the SQL modular and readable.
- **Why Window Functions (`OVER`)?** Unlike `GROUP BY`, `RANK() OVER (...)` and `SUM(revenue) OVER ()` compute rankings and platform-wide totals **without collapsing individual event rows**.
