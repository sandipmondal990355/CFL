-- Indexes for StartSmart Frequently Queried Fields

-- SS_CFL_ASSIGNMENT
CREATE INDEX IF NOT EXISTS idx_cfl_assign_cfl ON startsmart.ss_cfl_assignment (cfl_emp_id);
CREATE INDEX IF NOT EXISTS idx_cfl_assign_hr ON startsmart.ss_cfl_assignment (hr_emp_id);
CREATE INDEX IF NOT EXISTS idx_cfl_assign_mgr ON startsmart.ss_cfl_assignment (manager_emp_id);
CREATE INDEX IF NOT EXISTS idx_cfl_assign_mentor ON startsmart.ss_cfl_assignment (mentor_emp_id);
CREATE INDEX IF NOT EXISTS idx_cfl_assign_cfl_status ON startsmart.ss_cfl_assignment (cfl_emp_id, status);

-- SS_GOAL_WORKFLOW
CREATE INDEX IF NOT EXISTS idx_goal_wf_cfl_cycle ON startsmart.ss_goal_workflow (cfl_emp_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_goal_wf_cfl_stage ON startsmart.ss_goal_workflow (cfl_emp_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_goal_wf_cfl_status ON startsmart.ss_goal_workflow (cfl_emp_id, status);
CREATE INDEX IF NOT EXISTS idx_goal_wf_cycle_stage ON startsmart.ss_goal_workflow (cycle_id, stage_id);

-- SS_GOAL
CREATE INDEX IF NOT EXISTS idx_goal_wf ON startsmart.ss_goal (workflow_id);
CREATE INDEX IF NOT EXISTS idx_goal_cfl_cycle ON startsmart.ss_goal (cfl_emp_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_goal_cfl_stage ON startsmart.ss_goal (cfl_emp_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_goal_status ON startsmart.ss_goal (status);

-- SS_GOAL_REVIEW
CREATE INDEX IF NOT EXISTS idx_goal_rev_goal ON startsmart.ss_goal_review (goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_rev_wf ON startsmart.ss_goal_review (workflow_id);
CREATE INDEX IF NOT EXISTS idx_goal_rev_reviewer ON startsmart.ss_goal_review (reviewer_emp_id);

-- SS_MEETING
CREATE INDEX IF NOT EXISTS idx_meeting_sched ON startsmart.ss_meeting (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meeting_status ON startsmart.ss_meeting (status);

-- SS_MEETING_PARTICIPANT
CREATE INDEX IF NOT EXISTS idx_meet_part_meeting ON startsmart.ss_meeting_participant (meeting_id);
CREATE INDEX IF NOT EXISTS idx_meet_part_emp ON startsmart.ss_meeting_participant (emp_id);
CREATE INDEX IF NOT EXISTS idx_meet_part_emp_resp ON startsmart.ss_meeting_participant (emp_id, response_status);

-- SS_FEEDBACK
CREATE INDEX IF NOT EXISTS idx_feedback_from ON startsmart.ss_feedback (from_emp_id);
CREATE INDEX IF NOT EXISTS idx_feedback_to ON startsmart.ss_feedback (to_emp_id);
CREATE INDEX IF NOT EXISTS idx_feedback_meeting ON startsmart.ss_feedback (meeting_id);

-- SS_DOCUMENT
CREATE INDEX IF NOT EXISTS idx_doc_cfl ON startsmart.ss_document (cfl_emp_id);
CREATE INDEX IF NOT EXISTS idx_doc_type ON startsmart.ss_document (document_type);

-- SS_CFL_SKILL
CREATE INDEX IF NOT EXISTS idx_cfl_skill_cfl ON startsmart.ss_cfl_skill (cfl_emp_id);
CREATE INDEX IF NOT EXISTS idx_cfl_skill_skill ON startsmart.ss_cfl_skill (skill_id);

-- SS_PERFORMANCE_ASSESSMENT
CREATE INDEX IF NOT EXISTS idx_perf_cfl ON startsmart.ss_performance_assessment (cfl_emp_id);
CREATE INDEX IF NOT EXISTS idx_perf_cycle ON startsmart.ss_performance_assessment (cycle_id);
CREATE INDEX IF NOT EXISTS idx_perf_status ON startsmart.ss_performance_assessment (status);

-- SS_PROBATION_EVALUATION
CREATE INDEX IF NOT EXISTS idx_prob_cfl ON startsmart.ss_probation_evaluation (cfl_emp_id);
CREATE INDEX IF NOT EXISTS idx_prob_mgr ON startsmart.ss_probation_evaluation (manager_emp_id);
CREATE INDEX IF NOT EXISTS idx_prob_hr_status ON startsmart.ss_probation_evaluation (hr_status);

-- SS_RECOGNITION
CREATE INDEX IF NOT EXISTS idx_recog_from ON startsmart.ss_recognition (from_emp_id);
CREATE INDEX IF NOT EXISTS idx_recog_to ON startsmart.ss_recognition (to_emp_id);

-- SS_MEMORY
CREATE INDEX IF NOT EXISTS idx_memory_cfl ON startsmart.ss_memory (cfl_emp_id);
CREATE INDEX IF NOT EXISTS idx_memory_year ON startsmart.ss_memory (memory_year);

-- SS_NOTIFICATION
CREATE INDEX IF NOT EXISTS idx_notif_recip_read ON startsmart.ss_notification (recipient_emp_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_recip_created ON startsmart.ss_notification (recipient_emp_id, created_at);
