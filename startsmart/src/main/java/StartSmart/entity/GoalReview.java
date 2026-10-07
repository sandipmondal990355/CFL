package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_goal_review", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "goal_id", nullable = false)
    private Long goalId;

    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @Column(name = "reviewer_emp_id", nullable = false)
    private Long reviewerEmpId;

    @Column(name = "reviewer_role", nullable = false, length = 30)
    private String reviewerRole;

    @Column(name = "action", nullable = false, length = 30)
    private String action;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
