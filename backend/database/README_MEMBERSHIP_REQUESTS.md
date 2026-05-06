# Membership Requests & Notifications Setup

## Overview
This update adds a complete membership request flow where:
1. Users can request to join groups from the Explore page
2. Signatories receive notifications in the notification dropdown
3. Signatories can approve/reject requests directly from notifications
4. Users are notified of the decision

## Database Migration Required

Run this SQL script on your PostgreSQL database:

```bash
psql -U postgres -d remmogo -f backend/database/membership-requests.sql
```

Or copy and paste the contents of `backend/database/membership-requests.sql` into your database client.

This creates:
- `membershiprequests` table - stores join requests
- `notifications` table - stores user notifications
- `vw_pending_membership_requests` view - shows pending requests with user details
- `sp_approve_membership_request()` function - approves a request
- `sp_reject_membership_request()` function - rejects a request

## Backend Changes

### New Endpoints:
- `POST /api/members/:groupId/join` - Request to join a group
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/membership-requests/:groupId` - Get pending requests (signatories only)
- `POST /api/notifications/membership-requests/:id/approve` - Approve request (signatories only)
- `POST /api/notifications/membership-requests/:id/reject` - Reject request (signatories only)

### New Files:
- `backend/controllers/notificationController.js` - Notification logic
- `backend/routes/notificationRoutes.js` - Notification routes
- `backend/database/membership-requests.sql` - Database schema

### Modified Files:
- `backend/controllers/memberController.js` - Added `requestToJoin()` function
- `backend/routes/memberRoutes.js` - Added join route
- `backend/server.js` - Added notification routes

## Frontend Changes

### New Components:
- `src/components/NavBar/NotificationDropdown.jsx` - Notification bell with dropdown
- `src/components/NavBar/NotificationDropdown.css` - Styles

### Modified Files:
- `src/pages/explore/ExplorePage.jsx` - Updated join request to use new endpoint
- `src/services/api.js` - Added notifications API
- `src/components/NavBar/DashboardNavBar.jsx` - Added NotificationDropdown

## How It Works

### For Users Requesting to Join:
1. Go to Explore Groups page
2. Click "Request to Join" on any group (groups with < 12 members)
3. Optionally add a message to signatories
4. Submit request
5. Wait for notification about approval/rejection

### For Signatories:
1. Click the notification bell in the top bar
2. See "New Join Request" notifications
3. Click "Approve" or "Reject" directly in the notification
4. If rejecting, optionally provide a reason
5. Requester gets notified of the decision

## Notification Types
- `join_request` - New member wants to join (signatories only)
- `membership_approved` - Your join request was approved
- `membership_rejected` - Your join request was rejected
- `loan_request` - New loan request (signatories only)
- `contribution_approved` - Your contribution was approved

## Testing

1. **Test join request:**
   - Login as a regular user (not a signatory)
   - Go to Explore Groups
   - Click "Request to Join" on a group
   - Add a message and submit

2. **Test notification:**
   - Login as a signatory of that group
   - Click the notification bell
   - You should see the join request notification
   - Click "Approve" or "Reject"

3. **Test approval notification:**
   - Login back as the original user
   - Check notifications for the decision

## Troubleshooting

**"userId is required" error:**
- Make sure you're running the backend with proper JWT authentication
- The user ID comes from the authenticated token (`req.user.id`)

**No notifications showing:**
- Run the database migration script
- Check that the `notifications` table exists
- Verify the JWT token is being sent with requests

**Can't approve/reject:**
- Only users with role 'signatory' or 'admin' in that group can approve
- Check the `groupmembers` table for your role
