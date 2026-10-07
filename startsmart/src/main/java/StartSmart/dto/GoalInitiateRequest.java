package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalInitiateRequest {
    private Long stageId;
    private String meetingTitle;
    private String meetingAgenda;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingLink;
    private Long managerEmpCode;
    private List<Long> cflEmpCodes;
}
