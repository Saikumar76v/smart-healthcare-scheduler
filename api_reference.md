# Smart Healthcare Scheduler - Advanced Features API Reference

## Base URL
```
http://localhost:5000
```

## Authentication
All endpoints require Bearer token in header:
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

## 1. Cancel Appointment

**Endpoint**: `PUT /api/appointments/:id/cancel`

**Access**: Patient (who booked) or Admin

**Example Request**:
```bash
PUT /api/appointments/67890xyz123/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": {
    "_id": "67890xyz123",
    "patientId": "patient123",
    "doctorId": "doctor456",
    "date": "2026-02-05T00:00:00.000Z",
    "timeSlot": "10:00 AM",
    "status": "cancelled"
  }
}
```

**SMS Sent**:
- Patient: "Your appointment with Dr. Smith on 2/5/2026 at 10:00 AM has been cancelled."
- Doctor: "Appointment with John Doe on 2/5/2026 at 10:00 AM has been cancelled."

**Error Responses**:
- `404`: Appointment not found
- `403`: Not authorized to cancel this appointment

---

## 2. Reschedule Appointment

**Endpoint**: `PUT /api/appointments/:id/reschedule`

**Access**: Patient (who booked) or Admin

**Request Body**:
```json
{
  "newDate": "2026-02-10",
  "newTimeSlot": "02:00 PM"
}
```

**Success Response** (200):
```json
{
  "message": "Appointment rescheduled successfully",
  "appointment": {
    "_id": "67890xyz123",
    "patientId": "patient123",
    "doctorId": "doctor456",
    "date": "2026-02-10T00:00:00.000Z",
    "timeSlot": "02:00 PM",
    "status": "pending"
  }
}
```

**SMS Sent**:
- Patient: "Your appointment with Dr. Smith has been rescheduled from 2/5/2026 10:00 AM to 2/10/2026 02:00 PM."
- Doctor: "Appointment with John Doe has been rescheduled from 2/5/2026 10:00 AM to 2/10/2026 02:00 PM."

**Error Responses**:
- `400`: New time slot already booked. Choose another time.
- `403`: Not authorized to reschedule
- `404`: Appointment not found

---

## 3. Suggest Available Slot (AI Time-Slot Optimization)

**Endpoint**: `GET /api/appointments/suggest-slot/:doctorId`

**Query Parameters**:
- `daysToSearch` (optional): Number of days to search ahead (default: 7)

**Example Request**:
```bash
GET /api/appointments/suggest-slot/doctor456?daysToSearch=7
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "suggestedDate": "2026-02-03",
  "suggestedTimeSlot": "11:00 AM",
  "reason": "Earliest available slot",
  "alternativeSlots": ["02:00 PM", "04:00 PM"]
}
```

**No Slots Available**:
```json
{
  "suggestedDate": null,
  "suggestedTimeSlot": null,
  "reason": "No available slots in the next 7 days",
  "alternativeSlots": []
}
```

**Available Time Slots**:
- 09:00 AM
- 10:00 AM
- 11:00 AM
- 02:00 PM
- 04:00 PM

---

## 4. Doctor Calendar View

**Endpoint**: `GET /api/appointments/calendar/:doctorId`

**Query Parameters**:
- `days` (optional): Number of days ahead to show (default: 30)

**Example Request**:
```bash
GET /api/appointments/calendar/doctor456?days=30
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "2026-02-01": [
    {
      "_id": "apt001",
      "timeSlot": "10:00 AM",
      "patientName": "John Doe",
      "patientEmail": "john@example.com",
      "status": "approved"
    },
    {
      "_id": "apt002",
      "timeSlot": "02:00 PM",
      "patientName": "Jane Smith",
      "patientEmail": "jane@example.com",
      "status": "pending"
    }
  ],
  "2026-02-02": [
    {
      "_id": "apt003",
      "timeSlot": "11:00 AM",
      "patientName": "Bob Johnson",
      "patientEmail": "bob@example.com",
      "status": "approved"
    }
  ]
}
```

**Empty Calendar**:
```json
{}
```

---

## 5. Complete Workflow Example

### Scenario: Patient Books, Reschedules, Then Cancels

**Step 1: Book Appointment**
```bash
POST /api/appointments/book
{
  "doctorId": "doctor456",
  "date": "2026-02-05",
  "timeSlot": "10:00 AM"
}
```
✅ SMS sent to patient and doctor

**Step 2: Check Suggested Slots (Before Rescheduling)**
```bash
GET /api/appointments/suggest-slot/doctor456?daysToSearch=14
```
Response:
```json
{
  "suggestedDate": "2026-02-07",
  "suggestedTimeSlot": "02:00 PM",
  "reason": "Earliest available slot"
}
```

**Step 3: Reschedule to Suggested Slot**
```bash
PUT /api/appointments/67890xyz123/reschedule
{
  "newDate": "2026-02-07",
  "newTimeSlot": "02:00 PM"
}
```
✅ SMS sent to patient and doctor

**Step 4: Patient Changes Mind - Cancel**
```bash
PUT /api/appointments/67890xyz123/cancel
```
✅ SMS sent to patient and doctor

---

## 6. Conflict Detection Testing

### Test Double Booking Prevention

**First Booking**:
```bash
POST /api/appointments/book
{
  "doctorId": "doctor456",
  "date": "2026-02-08",
  "timeSlot": "10:00 AM"
}
```
✅ Success (201)

**Second Booking (Same Slot)**:
```bash
POST /api/appointments/book
{
  "doctorId": "doctor456",
  "date": "2026-02-08",
  "timeSlot": "10:00 AM"
}
```
❌ Error (400): "Time slot already booked"

---

## 7. Frontend Calendar View

### Doctor Dashboard
1. Login as doctor
2. Click "📅 View Calendar" button
3. Select time range (7/14/30 days)
4. View appointments grouped by date with color-coded status:
   - 🟢 Green: Approved
   - 🟡 Yellow: Pending
   - 🔴 Red: Cancelled

### URL
```
http://localhost:5173/doctor/calendar
```

---

## SMS Notification Summary

| Action | Patient SMS | Doctor SMS |
|--------|-------------|------------|
| Book | ✅ "Appointment booked" | ✅ "New request from [patient]" |
| Approve | ✅ "Approved by Dr. [name]" | ❌ |
| Reject | ✅ "Rejected by Dr. [name]" | ❌ |
| Cancel | ✅ "Appointment cancelled" | ✅ "[Patient] cancelled" |
| Reschedule | ✅ "Rescheduled from... to..." | ✅ "[Patient] rescheduled" |

---

## Testing With Postman

### Import Collection
Create a Postman collection with these endpoints:

1. **Book Appointment**
   - Method: POST
   - URL: `{{base_url}}/api/appointments/book`
   - Headers: `Authorization: Bearer {{token}}`

2. **Cancel Appointment**
   - Method: PUT
   - URL: `{{base_url}}/api/appointments/{{appointmentId}}/cancel`

3. **Reschedule Appointment**
   - Method: PUT
   - URL: `{{base_url}}/api/appointments/{{appointmentId}}/reschedule`
   - Body: `{"newDate": "2026-02-10", "newTimeSlot": "02:00 PM"}`

4. **Suggest Slot**
   - Method: GET
   - URL: `{{base_url}}/api/appointments/suggest-slot/{{doctorId}}?daysToSearch=7`

5. **Get Calendar**
   - Method: GET
   - URL: `{{base_url}}/api/appointments/calendar/{{doctorId}}?days=30`

### Environment Variables
```
base_url = http://localhost:5000
token = <JWT_TOKEN>
doctorId = <DOCTOR_ID>
appointmentId = <APPOINTMENT_ID>
```

---

## Error Codes Reference

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Appointment booked successfully |
| 400 | Bad Request | Slot already booked, invalid data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not authorized for this action |
| 404 | Not Found | Appointment ID doesn't exist |
| 500 | Server Error | Database or server issue |

---

## Production Deployment Checklist

- [ ] Test all endpoints with real Twilio account
- [ ] Set up verified phone numbers in Twilio
- [ ] Test conflict detection thoroughly
- [ ] Test reschedule with conflicts
- [ ] Verify SMS delivery for all workflows
- [ ] Test calendar view with 100+ appointments
- [ ] Add rate limiting to prevent abuse
- [ ] Set up monitoring for failed SMS
- [ ] Add logging for all appointment actions
