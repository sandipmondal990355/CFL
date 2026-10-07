package StartSmart.controller;

import StartSmart.dto.*;
import StartSmart.service.MentoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class MentoringController {

    private final MentoringService mentoringService;

    @GetMapping("/cfl/{cflEmpId}/sessions")
    public ResponseEntity<MentoringSessionsResponse> getMentoringSessions(@PathVariable Long cflEmpId) {
        log.info("REST request to get mentoring sessions for CFL: {}", cflEmpId);
        return ResponseEntity.ok(mentoringService.getMentoringSessions(cflEmpId));
    }

    @GetMapping("/cfl/{cflEmpId}/mentor-details")
    public ResponseEntity<MentorDetailsResponse> getMentorDetails(@PathVariable Long cflEmpId) {
        log.info("REST request to get mentor details for CFL: {}", cflEmpId);
        return ResponseEntity.ok(mentoringService.getMentorDetails(cflEmpId));
    }

    @PutMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<MentoringSessionDto> markSessionCompleted(@PathVariable Long sessionId) {
        log.info("REST request to mark session {} as completed", sessionId);
        return ResponseEntity.ok(mentoringService.markSessionCompleted(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/feedback")
    public ResponseEntity<MentoringSessionDto> submitCflFeedback(
            @PathVariable Long sessionId,
            @RequestBody CflFeedbackRequest request) {
        log.info("REST request to submit CFL feedback for session {}", sessionId);
        return ResponseEntity.ok(mentoringService.submitCflFeedback(sessionId, request));
    }
}