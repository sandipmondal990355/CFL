package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_goal", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "stage_id", nullable = false)
    private Long stageId;

    @Column(name = "cfl_emp_id", nullable = false)
    private Long cflEmpId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "weightage", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightage;

    @Column(name = "progress_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal progressPct = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "self_rating")
    private Integer selfRating;

    @Column(name = "self_remarks", columnDefinition = "TEXT")
    private String selfRemarks;

    @Column(name = "manager_rating")
    private Integer managerRating;

    @Column(name = "manager_remarks", columnDefinition = "TEXT")
    private String managerRemarks;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
