package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_goal_workflow", schema = "startsmart",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cycle_id", "stage_id", "cfl_emp_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalWorkflow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "stage_id", nullable = false)
    private Long stageId;

    @Column(name = "cfl_emp_id", nullable = false)
    private Long cflEmpId;

    @Column(name = "hr_emp_id", nullable = false)
    private Long hrEmpId;

    @Column(name = "manager_emp_id", nullable = false)
    private Long managerEmpId;

    @Column(name = "initial_meeting_id")
    private Long initialMeetingId;

    @Column(name = "review_meeting_id")
    private Long reviewMeetingId;

    @Column(name = "previous_stage_id")
    private Long previousStageId;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "meeting_completed_at")
    private LocalDateTime meetingCompletedAt;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @Column(name = "goal_submitted_at")
    private LocalDateTime goalSubmittedAt;

    @Column(name = "review_completed_at")
    private LocalDateTime reviewCompletedAt;

    @Column(name = "manager_remarks", columnDefinition = "TEXT")
    private String managerRemarks;

    @Column(name = "self_acceptance_status", length = 255)
    private String selfAcceptanceStatus;

    @Column(name = "self_acceptance_remarks", columnDefinition = "TEXT")
    private String selfAcceptanceRemarks;

    @Column(name = "self_accepted_at")
    private LocalDateTime selfAcceptedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
