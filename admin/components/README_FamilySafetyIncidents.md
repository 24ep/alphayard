# Circle Safety Incidents Component

## Overview
The `CircleSafetyIncidents` component provides a comprehensive interface for monitoring and managing emergency incidents within families in the admin console. It displays emergency incidents as a list with detailed information and allows administrators to acknowledge and resolve incidents.

## Features

### 1. Incident List View
- **Circle Selection**: Dropdown to select which Circle's incidents to view
- **Search & Filtering**: Search by incident title, user name, or message content
- **Type Filtering**: Filter by incident type (panic, medical, safety, weather, geofence, check-in)
- **Status Filtering**: Filter by incident status (active, acknowledged, resolved, false_alarm)
- **Statistics Dashboard**: Shows counts of active incidents, high priority incidents, acknowledged incidents, and resolved incidents

### 2. Incident Details
Each incident in the list shows:
- **Incident Type**: Visual icon indicating the type of emergency
- **Severity Level**: Color-coded severity (critical, high, medium, low)
- **Status**: Current status with color coding
- **User Information**: Name of the user who triggered the incident
- **Location**: Address where the incident occurred
- **Timestamp**: When the incident occurred (relative time)
- **Contact Count**: Number of emergency contacts involved

### 3. Detailed Incident View
Clicking on an incident opens a detailed modal showing:

#### User Information
- User's full name, email, and phone number
- User's avatar/profile picture

#### Incident Details
- Full incident message/description
- Incident type, severity, and status
- Exact timestamp

#### Location Information
- Full address
- GPS coordinates (latitude, longitude)
- Location accuracy

#### Emergency Contacts
- List of all emergency contacts
- Contact status (contacted/not contacted)
- When contacts were reached
- Contact phone numbers and relationships

#### Circle Members
- All Circle members who were notified
- Notification status and timestamps
- Member roles

#### Device Information
- Device type and model
- App version
- Battery level
- Network type

### 4. Incident Management
- **Acknowledge**: Mark active incidents as acknowledged
- **Resolve**: Mark acknowledged incidents as resolved
- **View Details**: Access comprehensive incident information

## Usage

### Integration
The component is integrated into the main Safety module with a tab-based interface:

```tsx
import { CircleSafetyIncidents } from './CircleSafetyIncidents'

// In the Safety component
{activeTab === 'incidents' ? (
  <CircleSafetyIncidents />
) : (
  // Other safety management content
)}
```

### Data Structure
The component expects incident data in the following format:

```typescript
interface EmergencyIncident {
  id: string
  CircleId: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar?: string
  }
  type: 'panic' | 'medical' | 'safety' | 'weather' | 'geofence' | 'check-in'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm'
  title: string
  message: string
  location: {
    latitude: number
    longitude: number
    address: string
    accuracy: number
  }
  timestamp: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
  contacts: Array<{
    id: string
    name: string
    phone: string
    relationship: string
    contacted: boolean
    contactedAt?: string
  }>
  CircleMembers: Array<{
    id: string
    name: string
    role: string
    notified: boolean
    notifiedAt?: string
  }>
  metadata: {
    deviceInfo?: string
    appVersion?: string
    batteryLevel?: number
    networkType?: string
  }
}
```

## Styling
The component uses Tailwind CSS classes and follows the existing admin console design system:
- Card-based layout
- Consistent color scheme (red for critical, orange for high priority, etc.)
- Responsive design
- Hover effects and transitions

## Future Enhancements
- Real-time updates via WebSocket
- Export incident data
- Bulk incident management
- Incident analytics and reporting
- Integration with external emergency services
- Automated incident response workflows

