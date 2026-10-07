package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_probation_evaluation", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProbationEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cfl_emp_id", nullable = false)
    private Long cflEmpId;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "manager_emp_id", nullable = false)
    private Long managerEmpId;

    @Column(name = "manager_rating")
    private Integer managerRating;

    @Column(name = "manager_feedback", columnDefinition = "TEXT")
    private String managerFeedback;

    @Column(name = "manager_submitted_at")
    private LocalDateTime managerSubmittedAt;

    @Column(name = "hr_status", nullable = false, length = 30)
    private String hrStatus;

    @Column(name = "hr_comment", columnDefinition = "TEXT")
    private String hrComment;

    @Column(name = "hr_action_at")
    private LocalDateTime hrActionAt;

    @Column(name = "final_status", length = 30)
    private String finalStatus;
}
