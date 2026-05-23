# 📅 Appointments API Documentation

## Base URL

```
Development: http://localhost:8000/api/appointments
Production: https://api.poolcrest.com/api/appointments
```

## Authentication Headers

All endpoints require a Bearer token in the Authorization header.

```
Authorization: Bearer <access_token>
```

---

## 📍 Appointment Endpoints

### 1. List Appointments

**GET** `/appointments/` 🔒

Retrieve a list of appointments.

- Customers see their own appointments.
- Technicians see their assigned appointments.
- Staff see all appointments.

#### Query Parameters

- `customer`, `technician`, `property`, `service` (uuid)
- `status`, `priority` (string)
- `start_date`, `end_date` (YYYY-MM-DD)
- `search` (string): Search by confirmation code, address, customer name.
- `ordering` (string): Order by `scheduled_date`, `created_at`, `priority`.

#### Response (200 OK)

```json
[
  {
    "id": "uuid-here",
    "confirmation_code": "ABC-123",
    "customer": "John Doe",
    "property": "123 Poolside Lane",
    "service": "Weekly Pool Cleaning",
    "scheduled_date": "2025-08-20T10:00:00Z",
    "status": "Confirmed"
  }
]
```

### 2. Get Appointment Details

**GET** `/appointments/{id}/` 🔒

Retrieve details for a specific appointment.

#### Response (200 OK)

```json
{
  "id": "uuid-here",
  "confirmation_code": "ABC-123",
  "customer": { ... },
  "technician": { ... },
  "property": { ... },
  "service": { ... },
  "scheduled_date": "2025-08-20T10:00:00Z",
  "status": "Confirmed",
  "priority": "normal",
  "notes": "Customer will leave the side gate open.",
  "total_amount": "50.00"
}
```

### 3. Create Appointment

**POST** `/appointments/` 🔒 (Staff)

Create a new appointment.

#### Request Body

```json
{
  "customer": "uuid-customer",
  "property": "uuid-property",
  "service": "uuid-service",
  "scheduled_date": "2025-08-21T14:00:00Z",
  "technician": "uuid-technician",
  "notes": "New appointment notes."
}
```

#### Response (201 Created)

(Returns the new appointment object)

### 4. Update Appointment

**PUT/PATCH** `/appointments/{id}/` 🔒 (Staff)

Update an existing appointment.

#### Response (200 OK)

(Returns the updated appointment object)

### 5. Delete Appointment

**DELETE** `/appointments/{id}/` 🔒 (Staff)

Soft-delete an appointment.

#### Response (204 No Content)

---

## 📍 Custom Appointment Actions

### Today's Appointments

**GET** `/appointments/today/` 🔒

### Upcoming Appointments

**GET** `/appointments/upcoming/` 🔒

### Past Due Appointments

**GET** `/appointments/past_due/` 🔒

### Confirm Appointment

**POST** `/appointments/{id}/confirm/` 🔒

### Cancel Appointment

**POST** `/appointments/{id}/cancel/` 🔒

### Reschedule Appointment

**POST** `/appointments/{id}/reschedule/` 🔒

### Start/Complete Service

**POST** `/appointments/{id}/start_service/` 🔒 (Technician)
**POST** `/appointments/{id}/complete_service/` 🔒 (Technician)

### Check-in/Check-out

**POST** `/appointments/{id}/check_in/` 🔒 (Technician)
**POST** `/appointments/{id}/check_out/` 🔒 (Technician)

### Calendar View

**GET** `/appointments/calendar/` 🔒

### Technician Schedule

**GET** `/appointments/technician_schedule/` 🔒

### Statistics

**GET** `/appointments/statistics/` 🔒 (Staff)

---

## 🔄 Recurring Appointment Endpoints

- **GET, POST** `/recurring-appointments/` 🔒 (Staff)
- **GET, PUT, PATCH, DELETE** `/recurring-appointments/{id}/` 🔒 (Staff)
- **POST** `/recurring-appointments/{id}/generate/` 🔒 (Staff)
- **POST** `/recurring-appointments/{id}/pause/` 🔒 (Staff)
- **POST** `/recurring-appointments/{id}/resume/` 🔒 (Staff)

---

## 🚨 Error Codes

| Status Code | Description                                         |
| ----------- | --------------------------------------------------- |
| 200         | Success                                             |
| 201         | Created successfully                                |
| 204         | No Content                                          |
| 400         | Bad request - validation errors                     |
| 401         | Unauthorized - invalid credentials or expired token |
| 403         | Forbidden - insufficient permissions                |
| 404         | Not found                                           |
| 500         | Internal server error                               |
