# StartSmart

## Project Overview

StartSmart is a CFL onboarding and employee development module integrated into the existing CDL application.

StartSmart will not have a separate authentication system.

CDL authentication, localStorage, sessionStorage, and employee APIs will be reused.

---

## Authentication

No separate login module will be developed.

The user will first log in to CDL.

After a successful CDL login, the existing session will be reused by StartSmart.

---

## Reused CDL Data

### localStorage

| Key | Example |
| --- | --- |
| EmployeeFullName | MANPREET KAUR |
| ProfileImage | default_profile.png |
| email | manpreet_kaur@cms.co.in |
| empId | 9085499 |
| firstName | MANPREET |
| lastName | KAUR |

### sessionStorage

| Key | Purpose |
| --- | --- |
| authToken | Authentication |
| employeeDateOfJoining | Employee joining date |
| locationId | Employee location |
| primaryContactNo | Contact number |
| role | Existing CDL roles |

Example:

["User", "CMS Employee", "CFL"]

---

## Employee API

GET

http://43.205.24.208:9020/employee/eCode/{empCode}

---

## StartSmart Roles

- CFL
- HR
- MANAGER
- MENTOR

A user can have multiple roles.

Examples:

["CFL"]

["CFL", "MENTOR"]

["CFL", "MANAGER"]

["CFL", "HR"]

["CFL", "HR", "MANAGER", "MENTOR"]

---

## Role-Based Screen Visibility

The visibility of StartSmart screens will be controlled by StartSmart roles.

After role determination, the roles will be stored in sessionStorage.

Key:

startSmartRoles

## User Roles

1. HR
2. Manager
3. Mentor
4. CFL

---

## CDL Integration

Reuse:

- Authentication
- Employee information
- Session management
- Employee profile API

Exclude:

- Separate login
- Password reset
- OTP flow

---

## Core Modules

1. Role-Based Access
2. CFL Assignment
3. Goal Management
4. Meeting Management
5. Document Management
6. Feedback Management
7. Dashboard
8. Probation Tracking
9. Memories
10. Rewards and Recognition
11. Email Notifications

---

## Development Phases

Phase 1:

- Database
- Authentication integration
- Role-based access

Phase 2:

- CFL assignment
- HR workflow

Phase 3:

- 30/60/90-day goals

Phase 4:

- Meetings
- Feedback

Phase 5:

- Dashboard
- Reports
- Notifications