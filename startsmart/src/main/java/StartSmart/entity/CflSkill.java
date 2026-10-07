package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "ss_cfl_skill", schema = "startsmart",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cfl_emp_id", "skill_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CflSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cfl_emp_id", nullable = false)
    private Long cflEmpId;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "proficiency", length = 30)
    private String proficiency;

    @Column(name = "experience_years", precision = 4, scale = 1)
    private BigDecimal experienceYears;
}
