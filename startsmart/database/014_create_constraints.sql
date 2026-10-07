-- Foreign Keys and Constraints for StartSmart Schema

ALTER TABLE startsmart.ss_goal_workflow
    ADD CONSTRAINT fk_gw_cycle FOREIGN KEY (cycle_id) REFERENCES startsmart.ss_goal_cycle(id),
    ADD CONSTRAINT fk_gw_stage FOREIGN KEY (stage_id) REFERENCES startsmart.ss_goal_stage(id),
    ADD CONSTRAINT fk_gw_prev_stage FOREIGN KEY (previous_stage_id) REFERENCES startsmart.ss_goal_stage(id);

ALTER TABLE startsmart.ss_goal
    ADD CONSTRAINT fk_goal_wf FOREIGN KEY (workflow_id) REFERENCES startsmart.ss_goal_workflow(id),
    ADD CONSTRAINT fk_goal_cycle FOREIGN KEY (cycle_id) REFERENCES startsmart.ss_goal_cycle(id),
    ADD CONSTRAINT fk_goal_stage FOREIGN KEY (stage_id) REFERENCES startsmart.ss_goal_stage(id);

ALTER TABLE startsmart.ss_goal_review
    ADD CONSTRAINT fk_gr_goal FOREIGN KEY (goal_id) REFERENCES startsmart.ss_goal(id),
    ADD CONSTRAINT fk_gr_wf FOREIGN KEY (workflow_id) REFERENCES startsmart.ss_goal_workflow(id);

ALTER TABLE startsmart.ss_meeting_participant
    ADD CONSTRAINT fk_mp_meeting FOREIGN KEY (meeting_id) REFERENCES startsmart.ss_meeting(id) ON DELETE CASCADE;

ALTER TABLE startsmart.ss_feedback
    ADD CONSTRAINT fk_feedback_meeting FOREIGN KEY (meeting_id) REFERENCES startsmart.ss_meeting(id) ON DELETE SET NULL;

ALTER TABLE startsmart.ss_cfl_skill
    ADD CONSTRAINT fk_cs_skill FOREIGN KEY (skill_id) REFERENCES startsmart.ss_skill(id) ON DELETE CASCADE;

ALTER TABLE startsmart.ss_performance_assessment
    ADD CONSTRAINT fk_pa_cycle FOREIGN KEY (cycle_id) REFERENCES startsmart.ss_goal_cycle(id);

ALTER TABLE startsmart.ss_competency_response
    ADD CONSTRAINT fk_cr_assess FOREIGN KEY (assessment_id) REFERENCES startsmart.ss_performance_assessment(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_cr_competency FOREIGN KEY (competency_id) REFERENCES startsmart.ss_competency(id) ON DELETE CASCADE;
