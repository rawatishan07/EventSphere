# Unit 3: Transactions, Triggers & Database Security (Applied to EventSphere)

> **Syllabus Coverage:** ACID Properties · `BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK` · Locking & Concurrency · Triggers · Database Security (RBAC & SQL Injection Prevention).

---

## 1. ACID Properties in EventSphere (`routes/bookings.js` & `routes/events.js`)
Every ticket booking (`POST /api/bookings`), cancellation (`POST /api/bookings/:id/cancel`), and event creation/deletion (`POST`/`DELETE /api/events`) runs inside an explicit SQLite transaction:

```js
await run('BEGIN TRANSACTION');
try {
  // 1. INSERT INTO bookings (...)
  // 2. INSERT INTO tickets (...)
  await run('COMMIT');
} catch (txErr) {
  await run('ROLLBACK');
  throw txErr;
}
```

| ACID Property | How EventSphere Enforces It |
| :--- | :--- |
| **Atomicity** | Either **both** the `bookings` row and its `tickets` row are saved (`COMMIT`), or **neither** is saved (`ROLLBACK`). |
| **Consistency** | `CHECK` constraints (`quantity > 0`, `total_seats > 0`, `status IN (...)`), `UNIQUE` constraints, and the **1-ticket-per-person** check keep the DB valid before and after every transaction. |
| **Isolation** | SQLite serializes write transactions, preventing two concurrent requests from overselling the last seat. |
| **Durability** | Once `COMMIT` succeeds, data is flushed to `backend/database/eventsphere.db` on disk. |

---

## 2. SQL Triggers & Audit Logging (`schema_sqlite.sql`)
EventSphere uses two **`AFTER` triggers** to maintain an immutable `audit_logs` table automatically—even if a row is modified outside the Node.js routes:

1. **`trg_booking_audit_insert` (`AFTER INSERT ON bookings`):**
   - Automatically inserts `BOOKING_CREATED` with `booking_reference`, `quantity`, and `total_amount`.
2. **`trg_booking_audit_cancel` (`AFTER UPDATE OF booking_status ON bookings`):**
   - Fires only `WHEN NEW.booking_status = 'CANCELLED' AND OLD.booking_status != 'CANCELLED'`, logging `BOOKING_CANCELLED` and the refunded amount.

---

## 3. Database Security: RBAC & SQL Injection Prevention
1. **Role-Based Access Control (`backend/middleware/rbac.js`):**
   - `requireRole(...allowedRoles)` resolves `x-user-id` from the `users` table and enforces strict role boundaries:
     - **`attendee`:** Can book 1 ticket per event and view/cancel **only** their own bookings (`403` on `/api/events` mutations or `/api/users` creation).
     - **`organizer` (Host):** Can create/edit/delete **only** their own events and view joined attendees for their own events (`403` if booking their own event or touching another host's event).
     - **`admin` (Super Admin):** Full platform governance, including user provisioning (`POST /api/users`).
2. **SQL Injection Prevention:**
   - **100% Parameterized Queries:** Every dynamic value is passed as a `?` placeholder (`query(sql, [param1, param2])`), never interpolated into SQL strings.
3. **HTTP Security Headers (`backend/server.js`):**
   - Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin`.
