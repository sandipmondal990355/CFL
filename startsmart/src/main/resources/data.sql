-- Seed Goal Stages
INSERT INTO startsmart.ss_goal_stage (stage_code, stage_name, sequence_no, duration_days, active)
VALUES 
('G30', '30 Days', 1, 30, TRUE),
('G60', '60 Days', 2, 60, TRUE),
('G90', '90 Days', 3, 90, TRUE)
ON CONFLICT (stage_code) DO NOTHING;

-- INSERT SAMPLE DATA

-- 1. Managers
INSERT INTO startsmart.ss_manager (emp_code, name, email, created_at, updated_at) VALUES
(2001, 'Ankit Chauhan', 'ankit.chauhan@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_manager (emp_code, name, email, created_at, updated_at) VALUES
(2002, 'Priya Sharma', 'priya.sharma@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_manager (emp_code, name, email, created_at, updated_at) VALUES
(2003, 'Vikram Reddy', 'vikram.reddy@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_manager (emp_code, name, email, created_at, updated_at) VALUES
(2004, 'Suresh Reddy', 'suresh.reddy@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;


-- 2. Mentors
INSERT INTO startsmart.ss_mentor (emp_code, name, email, created_at, updated_at) VALUES
(3001, 'Rohit Verma', 'rohit.verma@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_mentor (emp_code, name, email, created_at, updated_at) VALUES
(3002, 'Neha Singh', 'neha.singh@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_mentor (emp_code, name, email, created_at, updated_at) VALUES
(3003, 'Kiran Kumar', 'kiran.kumar@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_mentor (emp_code, name, email, created_at, updated_at) VALUES
(3004, 'Arjun Patel', 'arjun.patel@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_mentor (emp_code, name, email, created_at, updated_at) VALUES
(3005, 'Sandip Mondal', 'sandip.mondal@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;

INSERT INTO startsmart.ss_mentor (emp_code, name, email, created_at, updated_at) VALUES
(3006, 'Rudra Panda', 'rudra.panda@cms.co.in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (emp_code) DO NOTHING;


-- 3. CFL Assignments
INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085412, 1001, 2001, 3001, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085413, 1001, 2002, 3002, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085414, 1001, 2003, 3003, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085415, 1001, 2004, 3004, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085492, 1001, 2001, 3005, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085493, 1001, 2002, 3005, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO startsmart.ss_cfl_assignment (cfl_emp_code, hr_emp_code, manager_emp_code, mentor_emp_code, effective_from, status, created_at, updated_at) VALUES
(9085494, 1001, 2003, 3006, '2026-08-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
