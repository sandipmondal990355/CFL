package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorDetailsResponse {
    private String mentorName;
    private String mentorTitle;
    private String mentorEmail;
    private String initials;
    private int totalSessions;
    private int completedSessions;
    private int plannedSessions;
    private double yourAvgRating;
}