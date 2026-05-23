## Quotes API Documentation

This document describes the REST API exposed by the `quotes` app (router registers `quotes` and `promotions`). The app is typically included under `/api/quotes/` in the project routing. Replace the base path as appropriate for your deployment (for example `/api/quotes/quotes/` and `/api/quotes/promotions/`).

### Summary / contract

- Base resources: Quote, QuoteItem, Promotion
- Authentication: most endpoints require authentication (token/session). See each endpoint for permission details.
- Input: JSON request bodies following the serializers described below.
- Responses: JSON objects / lists. Errors use standard DRF shapes (400, 401, 403, 404).

## Endpoints

All endpoints below assume the base router path `/api/quotes/` (adjust if mounted elsewhere). Replace `{id}` with the quote or promotion UUID.

### Quote endpoints (QuoteViewSet)

- GET /quotes/

  - List quotes available to the requesting user.
  - Query params: `customer`, `property_ref`, `status`, `start_date`, `end_date`, `status_group` (pending|active|completed), `search`, `ordering`.
  - Permissions: Authenticated; customers see their own quotes, staff see all.
  - Serializer: `QuoteListSerializer` (lightweight fields)

- POST /quotes/

  - Create a new quote (customer-initiated flow). Uses `QuoteCreateSerializer`.
  - Body (example):
    {
    "customer_id": "<uuid>",
    "property_id": "<uuid>", # optional
    "title": "Window cleaning",
    "description": "Two-storey house",
    "requested_services": ["<service-uuid>"]
    }
  - Permissions: Authenticated (customers can create). The serializer validates existence/active state of provided IDs.
  - Response: Created quote (detailed view) or 400 with validation errors.

- GET /quotes/{id}/

  - Retrieve full quote details. Serializer: `QuoteDetailSerializer`.
  - Permissions: Authenticated + `IsOwnerOrStaff` (customer owner or staff).

- PUT/PATCH /quotes/{id}/

  - Update quote (admin-only for most fields). Uses `QuoteDetailSerializer` for updates.
  - Permissions: Admin only for full edit; staff members have limited abilities depending on action.

- DELETE /quotes/{id}/
  - Delete a quote (admin only).

Custom actions on quotes (all mounted under `/quotes/`):

- GET /quotes/my_quotes/

  - Returns quotes for the current customer.
  - Permissions: Authenticated, customer role required.

- GET /quotes/pending/

  - Staff endpoint to list pending quotes (initialized/processed).
  - Permissions: Staff member required.

- POST /quotes/{id}/process/

  - Staff processes a quote. Body uses `QuoteProcessSerializer` (partial fields allowed).
  - Example body:
    {
    "description": "Staff notes",
    "tax_rate": "0.075",
    "items": [
    {"service": "<service-uuid>", "item_type": "service", "description": "Service A", "quantity": 1, "unit_price": "100.00"}
    ],
    "valid_until": "2025-09-30"
    }
  - Permissions: Admin/Manager (IsAdminOrManager).
  - Response: Updated `QuoteDetailSerializer`.

- POST /quotes/{id}/send_to_customer/

  - Send processed quote to the customer. Body uses `QuoteSendSerializer` (optional message).
  - Permissions: Admin/Manager.
  - Response: message + quote detail.

- POST /quotes/{id}/confirm/

  - Customer confirms a quote. No body required (server-side checks in place).
  - Permissions: Authenticated and owner (customer).
  - Response: message + quote detail.

- POST /quotes/{id}/reject/

  - Customer rejects a quote. Body validated by `QuoteResponseSerializer` (optionally include `reason`).
  - Example body: { "action": "reject", "reason": "Too expensive" }
  - Permissions: Authenticated and owner (customer).

- POST /quotes/{id}/apply_promotion/

  - Apply a promotion code to a quote. Body: { "promotion_code": "PROMO10" }
  - Permissions: Customer (owner) or staff.
  - Response: updated quote or 400 + error message when invalid.

- POST /quotes/{id}/mark_viewed/

  - Mark quote as viewed by customer. No body.
  - Permissions: Customer (owner).

- POST /quotes/{id}/add_item/

  - Add a QuoteItem to the quote. Body matches `QuoteItemSerializer` fields (service, item_type, description, quantity, unit_price, ...).
  - Example:
    { "service": "<service-uuid>", "item_type": "service", "description": "Window cleaning", "quantity": 1, "unit_price": "60.00" }
  - Permissions: Admin/Manager (IsAdminOrManager).
  - Response: Created item (201) or validation errors.

- DELETE /quotes/{id}/remove_item/

  - Remove an item from the quote. Body: { "item_id": "<quote-item-uuid>" }
  - Permissions: Admin/Manager.

- GET /quotes/{id}/duplicate/

  - Duplicate a quote (staff-only). Creates and returns a new quote copy.
  - Permissions: Staff member required.

- POST /quotes/bulk_action/

  - Perform bulk actions on multiple quotes. Body uses `QuoteBulkActionSerializer`.
  - Example:
    {
    "quote_ids": ["<uuid>", "<uuid>"],
    "action": "send" # send|expire|cancel|extend
    "days_to_extend": 7 # required for extend
    }
  - Permissions: Admin/Manager.

- GET /quotes/statistics/
  - Returns aggregated statistics for quotes (counts, conversion_rate, revenue potential).
  - Permissions: Admin/Manager.

### Promotion endpoints (PromotionViewSet)

- GET /promotions/

  - List promotions.
  - Query params: `is_active`, `discount_type`, `validity` (active|upcoming|expired), `search`, `ordering`.
  - Permissions: Admin/Manager (the ViewSet is permissioned accordingly but check if read should be restricted in your deployment).

- POST /promotions/

  - Create a promotion. Body uses `PromotionSerializer` fields.
  - Example body:
    {
    "code": "SUMMER25",
    "name": "Summer discount",
    "discount_type": "percentage",
    "discount_value": "25.00",
    "valid_from": "2025-06-01T00:00:00Z",
    "valid_until": "2025-09-01T00:00:00Z",
    "is_active": true
    }
  - Permissions: Admin/Manager.

- GET /promotions/{id}/

  - Retrieve promotion details.

- PUT/PATCH /promotions/{id}/

  - Update promotion (sets `updated_by` automatically).

- DELETE /promotions/{id}/
  - Delete promotion.

Custom promotion actions:

- POST /promotions/{id}/toggle_active/

  - Toggle `is_active` flag. Permissions: Admin/Manager.

- GET /promotions/{id}/usage_report/

  - Returns usage stats and related quote data for the promotion. Permissions: Admin/Manager.

- GET /promotions/check_code/?code=CODE
  - Check whether a promotion code is currently valid. Returns `{ valid: boolean, promotion: <promotion> | null, message: string }`.

## Serializers / Request shapes (quick reference)

- QuoteCreateSerializer

  - Fields: `customer_id` (UUID, required), `property_id` (UUID, optional), `title`, `description`, `requested_services` (list of UUIDs)

- QuoteProcessSerializer

  - Fields: `description`, `items` (list of `QuoteItem` objects), `tax_rate`, `discount_percentage`, `discount_amount`, `terms_conditions`, `valid_until`.

- QuoteItemSerializer

  - Fields: `service` (UUID), `item_type` (service|material|labor|other), `description`, `detailed_description`, `quantity`, `unit_price`.

- QuoteSendSerializer

  - Fields: `message` (optional)

- QuoteResponseSerializer

  - Fields: `action` (confirm|reject), `reason` (optional when rejecting)

- ApplyPromotionSerializer

  - Fields: `promotion_code` (string)

- QuoteBulkActionSerializer
  - Fields: `quote_ids` (list of UUID), `action` (send|expire|cancel|extend), `days_to_extend` (required for extend)

## Permissions summary

- Most endpoints: `IsAuthenticated` required.
- Read (list/retrieve): `IsOwnerOrStaff` — customers see own quotes, staff see all.
- Processing, sending, bulk, promotion management: `IsAdminOrManager`.
- Create by customer: `IsAuthenticated` (customers create quotes via `QuoteCreateSerializer`).
- Update/Delete: typically `IsAdminOnly`.

## Common query parameters and searching

- Filtering: `customer`, `property_ref`, `status` via filterset.
- Date range: `start_date` and `end_date` (format YYYY-MM-DD) to filter `created_at`.
- `status_group`: `pending|active|completed` (maps to internal statuses).
- `search` uses `quote_number`, `title`, `description`, `customer__full_name`.
- `ordering` accepts fields like `created_at`, `total_amount`, `valid_until`, `status` (prefix with `-` for desc).

## Examples

1. Create a quote (customer):

Request POST /quotes/
{
"customer_id": "11111111-1111-1111-1111-111111111111",
"title": "Garden cleanup",
"description": "Front and back garden tidy up",
"requested_services": ["22222222-2222-2222-2222-222222222222"]
}

Success response: 201 Created
{
"id": "33333333-3333-3333-3333-333333333333",
"quote_number": "QTE-20250818-1234",
"title": "Garden cleanup",
"total_amount": "120.00",
...
}

2. Apply promotion:

POST /quotes/{id}/apply_promotion/
{
"promotion_code": "SUMMER25"
}

400 response when invalid: { "error": "Invalid or expired promotion code" }

## Errors and edge cases

- 400 Bad Request: Invalid payload, missing required fields, validation errors (e.g., negative prices, invalid UUIDs).
- 403 Forbidden: Permission checks failed (trying to process a quote as a non-staff user, or a customer attempting to edit someone else's quote).
- 404 Not Found: Resource (quote/promotion/item) does not exist or is deleted.

## Notes & implementation details

- Quote numbers are generated server-side (format: QTE-YYYYMMDD-XXXX).
- Totals (subtotal, discount, tax, total_amount) are calculated server-side when items or discounts change.
- Promotions have `is_valid` and `remaining_uses` convenience fields in the serializer.
- Many actions (send, confirm, reject, apply promotion) update related counters and timestamps.

## Where to change behavior

- Customizations are in `views.py`, `serializers.py`, and `models.py` in this app. See the following files:
  - `be/apps/quotes/views.py`
  - `be/apps/quotes/serializers.py`
  - `be/apps/quotes/models.py`

## Contact / troubleshooting

- If an endpoint returns unexpected permissions errors, ensure the requesting user has a `profile` with the expected role flags (`is_customer`, `is_staff_member`, role values, etc.).

---

Generated from the code in `be/apps/quotes` on repository snapshot.
