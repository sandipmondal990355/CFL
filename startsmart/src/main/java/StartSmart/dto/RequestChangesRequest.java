package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestChangesRequest {
    private Long cflEmpId;
    private String stageCode;
    private String managerRemarks;
}
