# Database

Database: PostgreSQL

Schema: startsmart

---

## Table: ss_cfl_assignment

Purpose:

Stores HR, Manager, Mentor, and CFL assignments.

Columns:

- id
- cfl_emp_code
- manager_emp_code
- mentor_emp_code
- hr_emp_code
- effective_from
- effective_to
- status
- created_at
- updated_at

---

## Table: ss_goal_cycle

Purpose:

Stores the 30/60/90-day cycle.

Columns:

- id
- cycle_name
- start_day
- end_day
- sequence_number

Data:

30_DAYS
60_DAYS
90_DAYS

---

## Table: ss_goal

Purpose:

Stores CFL goals.

Columns:

- id
- assignment_id
- cycle_id
- goal_title
- goal_description
- completion_status
- created_at
- updated_at

---

## Table: ss_goal_review

Purpose:

Stores goal reviews.

Columns:

- id
- goal_id
- reviewer_emp_code
- reviewer_role
- comments
- review_status
- reviewed_at

---

## Table: ss_meeting

Purpose:

Stores meeting information.

Columns:

- id
- assignment_id
- meeting_type
- meeting_date
- comments
- conducted_by

---

## Table: ss_document

Purpose:

Stores CFL documents.

Columns:

- id
- assignment_id
- document_type
- file_name
- file_path
- uploaded_at

---

## Table: ss_feedback

Purpose:

Stores mentor and manager feedback.

Columns:

- id
- assignment_id
- feedback_type
- comments
- created_at

---

## Table: ss_memory

Purpose:

Stores memories.

Columns:

- id
- assignment_id
- year
- media_url
- created_at