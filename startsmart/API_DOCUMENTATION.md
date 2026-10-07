# API Documentation

Base URL:

/startsmart

---

Authentication

Reuse CDL authentication.

---

Role APIs

GET /access/{empCode}

POST /assignment

GET /assignment/{empCode}

PUT /assignment/{id}

---

Goal APIs

POST /goals

GET /goals/{empCode}

PUT /goals/{goalId}

DELETE /goals/{goalId}

---

Meeting APIs

POST /meetings

GET /meetings/{empCode}

PUT /meetings/{meetingId}

---

Document APIs

POST /documents

GET /documents/{empCode}

DELETE /documents/{documentId}

---

Feedback APIs

POST /feedback

GET /feedback/{empCode}

---

Dashboard APIs

GET /dashboard/cfl/{empCode}

GET /dashboard/manager/{empCode}

GET /dashboard/hr/{empCode}

---

Memories APIs

POST /memories

GET /memories/{empCode}

---

Reports APIs

GET /reports/{empCode}