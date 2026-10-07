package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ss_goal_stage", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalStage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stage_code", nullable = false, unique = true, length = 20)
    private String stageCode;

    @Column(name = "stage_name", nullable = false, length = 50)
    private String stageName;

    @Column(name = "sequence_no", nullable = false, unique = true)
    private Integer sequenceNo;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
