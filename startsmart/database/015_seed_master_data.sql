-- Seed Master Data for StartSmart Goal Stages

INSERT INTO startsmart.ss_goal_stage (stage_code, stage_name, sequence_no, duration_days, active)
VALUES 
('G30', '30 Days', 1, 30, TRUE),
('G60', '60 Days', 2, 60, TRUE),
('G90', '90 Days', 3, 90, TRUE)
ON CONFLICT (stage_code) DO NOTHING;
