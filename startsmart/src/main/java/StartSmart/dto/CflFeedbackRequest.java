package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CflFeedbackRequest {
    private Long cflEmpId;
    private int rating;
    private String feedbackText;
    private List<String> tags;
}