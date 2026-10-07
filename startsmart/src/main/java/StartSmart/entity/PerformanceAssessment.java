package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_performance_assessment", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cfl_emp_id", nullable = false)
    private Long cflEmpId;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "performance_rating", nullable = false)
    private Integer performanceRating;

    @Column(name = "potential_rating", nullable = false)
    private Integer potentialRating;

    @Column(name = "talent_level", length = 50)
    private String talentLevel;

    @Column(name = "overall_comment", columnDefinition = "TEXT")
    private String overallComment;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_of_improvement", columnDefinition = "TEXT")
    private String areasOfImprovement;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
