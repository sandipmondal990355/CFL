package StartSmart.service;

import StartSmart.dto.CflFeedbackRequest;
import StartSmart.dto.MentorDetailsResponse;
import StartSmart.dto.MentoringSessionDto;
import StartSmart.dto.MentoringSessionsResponse;

public interface MentoringService {
    MentoringSessionsResponse getMentoringSessions(Long cflEmpId);
    MentorDetailsResponse getMentorDetails(Long cflEmpId);
    MentoringSessionDto markSessionCompleted(Long sessionId);
    MentoringSessionDto submitCflFeedback(Long sessionId, CflFeedbackRequest request);
}