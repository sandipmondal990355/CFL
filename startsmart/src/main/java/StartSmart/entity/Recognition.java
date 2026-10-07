package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_recognition", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recognition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_emp_id", nullable = false)
    private Long fromEmpId;

    @Column(name = "to_emp_id", nullable = false)
    private Long toEmpId;

    @Column(name = "recognition_type", nullable = false, length = 30)
    private String recognitionType;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
