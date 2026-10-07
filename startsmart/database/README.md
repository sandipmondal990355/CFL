# StartSmart Database Migrations

This directory contains the database migration scripts for the StartSmart application schema.

## Database Details
- **Database Engine**: PostgreSQL
- **Schema Reference**: `startsmart`
- **Tables Prefix**: `ss_`

## Order of Execution
Execute the SQL files in the following numeric order:

1. `001_create_schema.sql` (Initial Schema definition)
2. `002_create_goal_tables.sql` (Goal Cycles, Stages, Workflows, Goals and Reviews)
3. `003_create_assignment_tables.sql` (Manager, Mentor, and CFL Assignments)
4. `004_create_meeting_tables.sql` (Meetings and Participants)
5. `005_create_feedback_tables.sql` (Mentor/Manager/CFL Feedbacks)
6. `006_create_document_tables.sql` (CFL Documents uploads list)
7. `007_create_skill_tables.sql` (Skill details and CFL specific expertise)
8. `008_create_performance_tables.sql` (CFL Performance metrics assessment)
9. `009_create_competency_tables.sql` (Competencies list and responses)
10. `010_create_career_probation_tables.sql` (Roles movements and evaluations)
11. `011_create_recognition_memory_tables.sql` (Thanks recognitions and Memories timeline)
12. `012_create_notification_email_tables.sql` (System alerts and email sent logs)
13. `013_create_indexes.sql` (Speed optimize indices)
14. `014_create_constraints.sql` (Integrity PK validations & foreign keys)
15. `015_seed_master_data.sql` (Seeds G30, G60, and G90 stages metadata)
