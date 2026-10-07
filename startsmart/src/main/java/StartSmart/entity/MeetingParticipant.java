package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ss_meeting_participant", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meeting_id", nullable = false)
    private Long meetingId;

    @Column(name = "emp_id", nullable = false)
    private Long empId;

    @Column(name = "participant_role", nullable = false, length = 30)
    private String participantRole;

    @Column(name = "response_status", nullable = false, length = 30)
    private String responseStatus;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
}
