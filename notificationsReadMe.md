# Notification System API Implementation Guide

This document provides detailed specifications for backend developers to implement the notification system API endpoints required by the frontend application.

## Overview

The frontend notification system requires two main API endpoints:
1. Fetch resident notifications
2. Update notification read status

All endpoints should follow REST conventions and return standardized JSON responses.

## Endpoint Specifications

### 1. Fetch Resident Notifications

**Endpoint:** `GET /Notification/resident-msg-list`
**Description:** Retrieve all notifications for the authenticated resident user
**Authentication:** Required (Bearer Token)

#### Request
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
```

#### Response

**Success Response (200 OK):**
```json
{
  "succeeded": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "data": [
      {
        "id": "string",
        "notificationTitle": "string",
        "notificationMessage": "string",
        "receivedDate": "ISO 8601 datetime string",
        "isRead": "boolean"
      }
    ]
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "succeeded": false,
  "message": "Unauthorized access",
  "data": null
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "succeeded": false,
  "message": "Internal server error",
  "data": null
}
```

### 2. Update Notification Read Status

**Endpoint:** `POST /Notification/edit-resident-msg`
**Description:** Update the read status of one or more notifications
**Authentication:** Required (Bearer Token)

#### Request
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
[
  {
    "msgId": "string",
    "isRead": boolean
  }
]
```

**Request Example:**
```json
[
  {
    "msgId": "notification-123",
    "isRead": true
  }
]
```

#### Response

**Success Response (200 OK):**
```json
{
  "succeeded": true,
  "message": "Notification status updated successfully",
  "data": null
}
```

**Error Response (400 Bad Request):**
```json
{
  "succeeded": false,
  "message": "Invalid request data",
  "data": null
}
```

**Error Response (401 Unauthorized):**
```json
{
  "succeeded": false,
  "message": "Unauthorized access",
  "data": null
}
```

**Error Response (404 Not Found):**
```json
{
  "succeeded": false,
  "message": "Notification not found",
  "data": null
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "succeeded": false,
  "message": "Internal server error",
  "data": null
}
```

## Data Models

### Notification Object

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the notification |
| notificationTitle | string | Title/subject of the notification |
| notificationMessage | string | Full content of the notification message |
| receivedDate | string (ISO 8601) | Timestamp when the notification was created |
| isRead | boolean | Read status of the notification |

## Implementation Notes

1. **Authentication**: Both endpoints require a valid JWT token in the Authorization header
2. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
3. **Pagination**: For residents with many notifications, consider adding pagination support
4. **Data Validation**: Validate all incoming data, especially msgId format and isRead boolean
5. **Audit Trail**: Consider logging notification status changes for auditing purposes
6. **Performance**: Optimize database queries for fetching notifications, especially for residents with many notifications

## Example Usage Flow

1. Frontend calls `GET /Notification/resident-msg-list` to fetch all notifications for the resident
2. User clicks on a notification to view details
3. Frontend automatically calls `POST /Notification/edit-resident-msg` with `isRead: true` to mark the notification as read
4. Frontend refreshes the notification list to reflect the updated status

## Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (invalid data)
- 401: Unauthorized (missing or invalid token)
- 404: Not found (notification doesn't exist)
- 500: Internal server error

Error responses should always follow the standardized format:
```json
{
  "succeeded": false,
  "message": "Human-readable error message",
  "data": null
}
```

## Testing

To test these endpoints during development:
1. Use Postman or similar tool to simulate requests
2. Ensure proper authentication headers are included
3. Test both success and error scenarios
4. Verify that notification status changes are persisted correctly
5. Test edge cases like invalid notification IDs

## Future Considerations

Potential future enhancements that may require additional endpoints:
- Notification filtering (by date, type, read status)
- Bulk operations (mark all as read, delete notifications)
- Push notification support
- Notification preferences/settings