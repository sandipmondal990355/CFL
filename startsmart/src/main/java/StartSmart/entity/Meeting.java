package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_meeting", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meeting_type", nullable = false, length = 50)
    private String meetingType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "agenda", columnDefinition = "TEXT")
    private String agenda;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "mode", nullable = false, length = 20)
    private String mode;

    @Column(name = "meeting_link", length = 1000)
    private String meetingLink;

    @Column(name = "external_meeting_id", length = 255)
    private String externalMeetingId;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_for")
    private Long createdFor;
}
