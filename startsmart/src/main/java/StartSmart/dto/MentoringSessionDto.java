package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringSessionDto {
    private Long id;
    private String dateTimeStr;
    private String countdown;
    private String status;
    private String topic;
    private String mode;
    private String createdBy;
    private String meetingUrl;
    private boolean feedbackComplete;
    private FeedbackDetailsDto mentorFeedback;
    private FeedbackDetailsDto cflFeedback;
}