package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_career_movement", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cfl_emp_id", nullable = false, unique = true)
    private Long cflEmpId;

    @Column(name = "existing_role", length = 100)
    private String existingRole;

    @Column(name = "formal_role", length = 100)
    private String formalRole;

    @Column(name = "current_skills", length = 255)
    private String currentSkills;

    @Column(name = "skills_gap", columnDefinition = "TEXT")
    private String skillsGap;

    @Column(name = "possible_movement", length = 100)
    private String possibleMovement;

    @Column(name = "can_be_backup")
    private Boolean canBeBackup;

    @Column(name = "backup_for_emp_name", length = 150)
    private String backupForEmpName;

    @Column(name = "project1", length = 200)
    private String project1;

    @Column(name = "project2", length = 200)
    private String project2;

    @Column(name = "project3", length = 200)
    private String project3;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
