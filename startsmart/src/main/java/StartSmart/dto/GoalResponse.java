package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private Long id;
    private Long workflowId;
    private Long cycleId;
    private Long stageId;
    private String stageCode;
    private Long cflEmpId;
    private String title;
    private String description;
    private LocalDate targetDate;
    private BigDecimal weightage;
    private BigDecimal progressPct;
    private String status;
    private Integer selfRating;
    private String selfRemarks;
    private Integer managerRating;
    private String managerRemarks;
    private LocalDateTime createdAt;
}
