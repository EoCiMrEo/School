# 🏡 Properties API Documentation

## Base URL

```
Development: http://localhost:8000/api/properties
Production: https://api.poolcrest.com/api/properties
```

## Authentication Headers

All endpoints require a Bearer token in the Authorization header.

```
Authorization: Bearer <access_token>
```

---

## 📍 Property Endpoints

### 1. List Properties

**GET** `/properties/` 🔒

Retrieve a list of properties.

- Customers see their own properties.
- Technicians see properties in their service areas.
- Staff see all properties.

#### Query Parameters

- `customer` (uuid): Filter by customer ID.
- `is_active` (boolean): Filter by active status.
- `pool_type` (string): Filter by pool type.
- `zip_code` (string): Filter by zip code.
- `search` (string): Search by name, address, city.
- `ordering` (string): Order by `created_at`, `property_name`.

#### Response (200 OK)

```json
[
  {
    "id": "uuid-here",
    "property_name": "Main Residence",
    "address_line1": "123 Poolside Lane",
    "city": "Beverly Hills",
    "state": "CA",
    "zip_code": "90210",
    "is_active": true
  }
]
```

### 2. Get Property Details

**GET** `/properties/{id}/` 🔒

Retrieve details for a specific property.

#### Response (200 OK)

```json
{
  "id": "uuid-here",
  "property_name": "Main Residence",
  "customer": "uuid-customer",
  "address_line1": "123 Poolside Lane",
  "city": "Beverly Hills",
  "state": "CA",
  "zip_code": "90210",
  "pool_type": "inground_concrete",
  "pool_size": "large",
  "is_active": true,
  "photos": [],
  "property_notes": []
}
```

### 3. Create Property

**POST** `/properties/` 🔒

Create a new property.

#### Request Body

```json
{
  "property_name": "Vacation Home",
  "customer": "uuid-customer",
  "address_line1": "456 Ocean View",
  "city": "Malibu",
  "state": "CA",
  "zip_code": "90265",
  "pool_type": "inground_vinyl",
  "pool_size": "medium"
}
```

#### Response (201 Created)

(Returns the new property object)

### 4. Update Property

**PUT/PATCH** `/properties/{id}/` 🔒

Update an existing property.

#### Response (200 OK)

(Returns the updated property object)

### 5. Delete Property

**DELETE** `/properties/{id}/` 🔒

Soft-delete a property.

#### Response (204 No Content)

---

## 📍 Custom Property Actions

### My Properties

**GET** `/properties/my_properties/` 🔒 (Customers)

Get a list of properties owned by the current user.

### Upload Photo

**POST** `/properties/{id}/upload_photo/` 🔒

Upload a photo for a property.

### Add Note

**POST** `/properties/{id}/add_note/` 🔒

Add a note to a property.

### Service History

**GET** `/properties/{id}/service_history/` 🔒

Get the service history for a property.

### Set as Primary

**POST** `/properties/{id}/set_primary/` 🔒

Set a property as the primary one for a customer.

---

## 📸 Property Photo Endpoints

- **GET, POST** `/property-photos/`
- **GET, PUT, PATCH, DELETE** `/property-photos/{id}/`
- **POST** `/property-photos/{id}/set_primary/`

---

## 📝 Property Note Endpoints

- **GET, POST** `/property-notes/`
- **GET, PUT, PATCH, DELETE** `/property-notes/{id}/`

---

## 🗺️ Service Area Endpoints

- **GET, POST** `/service-areas/` 🔒 (Staff)
- **GET, PUT, PATCH, DELETE** `/service-areas/{id}/` 🔒 (Staff)
- **POST** `/service-areas/{id}/add_zip_code/` 🔒 (Staff)
- **POST** `/service-areas/{id}/remove_zip_code/` 🔒 (Staff)
- **GET** `/service-areas/{id}/properties/` 🔒 (Staff)
- **GET** `/service-areas/check_coverage/`

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
