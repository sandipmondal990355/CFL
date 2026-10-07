package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ss_competency_response", schema = "startsmart",
       uniqueConstraints = @UniqueConstraint(columnNames = {"assessment_id", "competency_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetencyResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(name = "competency_id", nullable = false)
    private Long competencyId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", nullable = false, columnDefinition = "TEXT")
    private String comment;
}
