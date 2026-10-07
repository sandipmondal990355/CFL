package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalWorkflowResponse {
    private Long id;
    private Long cycleId;
    private Long stageId;
    private String stageName;
    private String stageCode;
    private Long cflEmpId;
    private String cflName;
    private Long managerEmpId;
    private String managerName;
    private String status;
    private String meetingLink;
    private LocalDateTime meetingTime;
    private Integer goalProgress;
    private LocalDateTime meetingCompletedAt;
    private LocalDateTime unlockedAt;
    private LocalDateTime goalSubmittedAt;
    private String managerRemarks;
    private String selfAcceptanceStatus;
    private String selfAcceptanceRemarks;
    private LocalDateTime selfAcceptedAt;
}
