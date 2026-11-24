# Unit 4: Performance, NoSQL & Real-World Applications (Applied to EventSphere)

> **Syllabus Coverage:** Query Optimization & Execution Plans (`EXPLAIN QUERY PLAN`) · B-Tree vs. Hash Indexing · NoSQL Concepts (Document & Key-Value Stores) · Cloud Databases & Data Warehousing (OLTP vs. OLAP / ETL).

---

## 1. Query Optimization & `EXPLAIN QUERY PLAN` (`routes/dbms.js`)
In `GET /api/dbms/overview` (and the **DBMS Lab** UI tab), EventSphere runs a live execution plan check:
```sql
EXPLAIN QUERY PLAN
SELECT id, title, event_date
FROM events
WHERE status = 'UPCOMING'
ORDER BY event_date;
```
- Because `idx_events_status` exists on `events(status)`, SQLite uses **`SEARCH events USING INDEX idx_events_status (status=?)`** (B-Tree lookup in $O(\log N)$) instead of a full `SCAN events` ($O(N)$).
- **B-Tree vs. Hash Indexing:**
  - **B-Tree Index** (used in SQLite & MySQL InnoDB): Supports both equality (`=`) and range/sorting (`<`, `>`, `BETWEEN`, `ORDER BY event_date`).
  - **Hash Index**: $O(1)$ for exact equality (`=`) only; cannot sort or do range queries.

---

## 2. RDBMS vs. NoSQL Document Store (Live Comparison in EventSphere)
While EventSphere's primary backend uses a **normalized RDBMS (3NF/BCNF)** for strict ACID integrity, **Unit 4** also demonstrates how the same booking looks in a **NoSQL Document Store (MongoDB / Firebase)**—and in fact uses a `localStorage` JSON document fallback (`frontend/src/services/fallbackApi.js`) when hosted statically on Netlify!

| Dimension | Relational (SQLite / MySQL in EventSphere) | NoSQL Document (MongoDB / `bookings_nosql` View) |
| :--- | :--- | :--- |
| **Structure** | Normalized across `bookings`, `events`, `venues`, `users`, `tickets` | Denormalized single nested JSON document (`_id: "ES-2026-8812"`) |
| **Joins** | `INNER JOIN` / `LEFT JOIN` at query time | Embedded sub-objects (`event: {...}`, `venue: {...}`) — zero joins |
| **Consistency** | Strict ACID + Foreign Keys + `CHECK` constraints | Eventual or single-document atomicity; schema-flexible |
| **Best For** | Financial ticketing, seat inventory, zero-oversell | Rapid prototyping, read-heavy feeds, static/edge caching |

---

## 3. Cloud Databases & Data Warehousing Context
- **OLTP (Online Transaction Processing):** EventSphere's normalized tables (`events`, `bookings`, `tickets`) handle high-frequency writes (bookings, cancellations) with ACID guarantees (deployable on **AWS RDS**, **Azure SQL**, or **Turso/SQLite**).
- **OLAP / Data Warehousing (ETL → Star Schema):** For enterprise BI (**Google BigQuery**, **Snowflake**), transactional rows are extracted, transformed, and loaded (ETL) into a **Star Schema** (`v_fact_bookings_star`) for fast executive reporting without slowing down live ticket checkouts.
