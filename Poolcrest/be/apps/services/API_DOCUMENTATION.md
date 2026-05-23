# 🛠️ Services API Documentation

## Base URL

```
Development: http://localhost:8000/api/services
Production: https://api.poolcrest.com/api/services
```

## Authentication Headers

Most endpoints are public for viewing (`GET`). Endpoints for creating, updating, or deleting services require a Bearer token in the Authorization header.

```
Authorization: Bearer <access_token>
```

---

## 📍 Service Endpoints

### 1. List Services

**GET** `/services/`

Retrieve a list of all active services. This endpoint is **public**.

#### Query Parameters

- `category` (string): Filter by service category.
- `status` (boolean): Filter by active status.
- `seasonal_availability` (string): Filter by season (e.g., 'summer').
- `min_price` (number): Filter by minimum price.
- `max_price` (number): Filter by maximum price.
- `search` (string): Search by name, description, or category.
- `ordering` (string): Order by `name`, `base_price`, `created_at`.

#### Response (200 OK)

```json
[
  {
    "id": "uuid-here",
    "name": "Weekly Pool Cleaning",
    "category": "Maintenance",
    "base_price": "50.00",
    "status": true
  }
]
```

### 2. Get Service Details

**GET** `/services/{id}/`

Retrieve details for a specific service. This endpoint is **public**.

#### Response (200 OK)

```json
{
  "id": "uuid-here",
  "name": "Weekly Pool Cleaning",
  "description": "Comprehensive weekly cleaning service.",
  "category": "Maintenance",
  "base_price": "50.00",
  "duration_minutes": 60,
  "status": true,
  "seasonal_availability": "summer,spring,fall",
  "created_at": "2025-08-12T10:00:00Z",
  "updated_at": "2025-08-12T10:00:00Z"
}
```

### 3. Create Service

**POST** `/services/` 🔒 (Admin/Manager)

Create a new service.

#### Request Body

```json
{
  "name": "New Service",
  "description": "Description of the new service.",
  "category": "Repair",
  "base_price": "150.00",
  "duration_minutes": 90,
  "status": true
}
```

#### Response (201 Created)

(Returns the new service object, same as "Get Service Details")

### 4. Update Service

**PUT/PATCH** `/services/{id}/` 🔒 (Admin/Manager)

Update an existing service.

#### Request Body (all fields optional for PATCH)

```json
{
  "name": "Updated Service Name",
  "base_price": "160.00"
}
```

#### Response (200 OK)

(Returns the updated service object)

### 5. Delete Service

**DELETE** `/services/{id}/` 🔒 (Admin Only)

Delete a service.

#### Response (240 No Content)

---

## 📍 Custom Actions

### Get Service Categories

**GET** `/services/categories/`

Get a list of all service categories with counts.

#### Response (200 OK)

```json
[
  {
    "category": "Maintenance",
    "count": 5,
    "services": [
      {
        "id": "uuid-here",
        "name": "Weekly Pool Cleaning",
        "category": "Maintenance",
        "base_price": "50.00",
        "status": true
      }
    ]
  }
]
```

### Get Popular Services

**GET** `/services/popular/`

Get a list of the most popular services.

### Get Seasonal Services

**GET** `/services/seasonal/`

Get services available for the current season.

### Toggle Service Status

**POST** `/services/{id}/toggle_status/` 🔒 (Admin/Manager)

Toggle the active/inactive status of a service.

#### Response (200 OK)

```json
{
  "message": "Service 'Weekly Pool Cleaning' is now inactive",
  "status": false
}
```

### Duplicate Service

**POST** `/services/{id}/duplicate/` 🔒 (Admin/Manager)

Create a copy of an existing service.

#### Response (201 Created)

(Returns the new duplicated service object)

### Get Service Statistics

**GET** `/services/statistics/` 🔒 (Admin/Manager)

Get statistics about the services.

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

---

## 🔒 Security Notes

1.  **HTTPS Required**: Always use HTTPS in production.
2.  **Permissions**: Access to endpoints is restricted based on user roles (Customer, Technician, Manager, Admin).
3.  **CORS**: Configure CORS properly for your frontend domain.
4.  **Rate Limiting**: Endpoints are rate-limited to prevent abuse.
