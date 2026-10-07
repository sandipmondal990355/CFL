package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProbationEvaluationResponse {
    private Long id;
    private Long cflEmpId;
    private String cflName;
    private String managerName;
    private String stage; // e.g. "Not Eligible Yet", "Confirmed"
    private LocalDate submittedOn; // e.g. due_date or managerSubmittedAt
    private String recommendation; // e.g. "Confirm"
    private String buHeadApproval; // e.g. "Vikram Reddy"
    private LocalDateTime buHeadApprovalDate;
    private String hrApproval; // e.g. "Mrudul Mangoli"
    private LocalDateTime hrApprovalDate;
}
