CREATE TABLE IF NOT EXISTS startsmart.ss_cfl_profile (
    cfl_emp_id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    department VARCHAR(255),
    business_unit VARCHAR(255),
    goal_progress INT DEFAULT 0
);
