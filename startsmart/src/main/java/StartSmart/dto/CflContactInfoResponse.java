package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CflContactInfoResponse {
    private Long cflEmpId;
    private String cflName;
    private String cflEmail;
    
    private String mentorName;
    private String mentorEmail;
    private String mentorDepartment;
    
    private String managerName;
    private String managerEmail;
    private String managerDepartment;
    
    private String hrName;
    private String hrEmail;
    private String hrLocation;
}
