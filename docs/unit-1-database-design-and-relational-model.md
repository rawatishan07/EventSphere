# Unit 1: Database Design & Relational Model (Applied to EventSphere)

> **Syllabus Coverage:** DBMS vs. File Systems · DBMS vs. RDBMS & E. F. Codd's Rules · ER & EER Modeling (Entities, Relationships, Generalization/Specialization, Aggregation) · Relational Schema, Keys (PK, FK, Candidate, Surrogate, Composite), Integrity Constraints · Normalization (1NF → BCNF) · Star & Snowflake Schemas.

---

## 1. Database vs. File Systems (Why EventSphere Uses a DBMS)
If EventSphere stored bookings in flat JSON/CSV files:
- **Redundancy & Inconsistency:** Updating a venue's capacity or event title would require rewriting every booking record.
- **No Concurrent Safety:** Two attendees clicking "Book" at the same millisecond could oversell the last seat (race condition).
- **No Declarative Constraints:** Nothing stops a negative `total_seats` or an orphan ticket pointing to a deleted event.

A **Relational DBMS (SQLite 3 / MySQL 8.0)** gives EventSphere **ACID transactions**, **Foreign Key referential integrity**, **CHECK constraints**, and **B-Tree indexed queries**.

---

## 2. DBMS vs. RDBMS & E. F. Codd's Rules in EventSphere
| Concept | How EventSphere Satisfies It |
| :--- | :--- |
| **Rule 1 (Information Rule)** | All data (events, bookings, tickets, audit logs) is stored strictly as values in tables (rows & columns). |
| **Rule 2 (Guaranteed Access)** | Every scalar value is addressable via `Table Name + Primary Key (id) + Column Name`. |
| **Rule 5 (Comprehensive Data Sublanguage)** | SQL handles DDL (`CREATE TABLE`), DML (`SELECT/INSERT/UPDATE/DELETE`), and TCL (`BEGIN TRANSACTION/COMMIT/ROLLBACK`). |
| **Rule 10 (Integrity Independence)** | Constraints (`CHECK`, `UNIQUE`, `FOREIGN KEY`) live inside `schema_sqlite.sql`, not just in JavaScript. |

---

## 3. ER & EER Model in EventSphere
- **Strong Entities:** `venues`, `categories`, `users`, `events`, `audit_logs`.
- **Weak / Dependent Entities:** `ticket_tiers` (depends on `events`), `tickets` (depends on `bookings` via `ON DELETE CASCADE`).
- **EER Specialization (Total/Disjoint):** `users` is a generalized superclass specialized by `role CHECK (role IN ('attendee', 'organizer', 'admin'))`:
  - **Attendee:** Discovers events, books 1 pass per event, views/cancels own tickets.
  - **Organizer (Host):** Creates/edits/deletes own events, views Joined Attendees Roster.
  - **Admin (Super Admin):** Provisions new users and governs all platform data.
- **M:N Relationship Resolution:** A user can book many events, and an event has many users (`M:N`). We resolve this via the associative entity **`bookings`** (`1:N` from `users` and `1:N` from `events`), enforcing **1 active ticket per user per event** in application logic.

---

## 4. Keys & "Why This Key, Why Not Another?"

| Table | Primary Key | Candidate Keys (`UNIQUE`) | Foreign Keys | Why Surrogate `id` Instead of Natural PK? |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `id` (Surrogate) | `email` | — | Emails can change; integer `id` is 4–8 bytes, fast in B-Tree joins. |
| `categories` | `id` (Surrogate) | `name`, `slug` | — | Category names/slugs can be renamed without cascading updates to `events`. |
| `venues` | `id` (Surrogate) | — | — | Two cities can have a "Grand Hall"; name isn't globally unique. |
| `events` | `id` (Surrogate) | — | `category_id`, `venue_id`, `organizer_id` | Event titles/dates can be edited; integer PK keeps `bookings` compact. |
| `ticket_tiers` | `id` (Surrogate) | — | `event_id` | Tier names ("VIP") repeat across different events. |
| `bookings` | `id` (Surrogate) | `booking_reference` | `user_id`, `event_id`, `ticket_tier_id` | `booking_reference` (`ES-2026-8812`) is human-facing; integer `id` speeds up `tickets.booking_id` joins. |
| `tickets` | `id` (Surrogate) | `ticket_code` | `booking_id` | `ticket_code` (`TKT-AI-001`) is scanned at entry; `id` is internal row key. |

---

## 5. Referential Integrity & Cascade Choices (`RESTRICT` vs `CASCADE` vs `SET NULL`)

| Child Table → Parent Table | Action | Why This Exact Action? |
| :--- | :--- | :--- |
| `events.category_id → categories.id` | `ON DELETE RESTRICT` | Prevents deleting a category that still has events. |
| `events.venue_id → venues.id` | `ON DELETE RESTRICT` | Prevents deleting a venue with scheduled events. |
| `events.organizer_id → users.id` | `ON DELETE RESTRICT` | Prevents deleting a host who still owns events. |
| `ticket_tiers.event_id → events.id` | `ON DELETE CASCADE` | Tiers have no meaning without their parent event. |
| `bookings.user_id → users.id` | `ON DELETE RESTRICT` | Preserves financial & attendance history; never silently wipe paid bookings. |
| `bookings.event_id → events.id` | `ON DELETE RESTRICT` | Forces explicit cancellation/refund before an event can be removed. |
| `bookings.ticket_tier_id → ticket_tiers.id` | `ON DELETE SET NULL` | If a tier is retired, the historical booking record remains intact. |
| `tickets.booking_id → bookings.id` | `ON DELETE CASCADE` | Individual passes belong strictly to their parent booking. |

---

## 6. Normalization Proof (1NF → BCNF)
- **1NF (Atomic Values & No Repeating Groups):** Every column holds a single scalar value (`ticket_code`, `seat_label` are separate rows in `tickets`, never comma-separated inside `bookings`).
- **2NF (No Partial Dependencies):** Every table uses a single-column PK (`id`), so no non-key attribute can depend on part of a composite key.
- **3NF (No Transitive Dependencies):** `events` stores `venue_id` instead of `venue_name` or `venue_city`; `bookings` stores `user_id` instead of `user_email`. (`unit_price` and `total_amount` in `bookings` are intentional **historical price snapshots** at purchase time, so future price edits don't alter past receipts.)
- **BCNF (Every Determinant is a Candidate Key):** Every functional dependency (`id → *`, `email → *`, `booking_reference → *`, `ticket_code → *`, `slug → *`) has a superkey on the left-hand side.

---

## 7. Star Schema for BI Analytics (`v_fact_bookings_star`)
While OLTP tables are normalized to **BCNF** to prevent write anomalies, analytics queries need fast aggregations. In `backend/database/schema_sqlite.sql`, **`v_fact_bookings_star`** exposes a **Star Schema** view:
- **Fact Table:** `bookings` (measures: `quantity`, `total_amount`)
- **Dimension Tables:** `events`, `categories`, `venues`, `users`
- **Why Star over Snowflake here?** Dimension attributes (`category_name`, `venue_city`) are flattened into one join view, minimizing query complexity for the **DBMS Lab** dashboard.
