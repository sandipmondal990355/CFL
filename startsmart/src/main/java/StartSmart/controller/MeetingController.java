package StartSmart.controller;

import StartSmart.dto.CflContactInfoResponse;
import StartSmart.dto.MeetingCreateRequest;
import StartSmart.dto.MeetingResponse;
import StartSmart.service.MeetingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping("/cfl/{cflEmpId}/contacts")
    public ResponseEntity<CflContactInfoResponse> getCflContacts(@PathVariable Long cflEmpId) {
        log.info("REST request to get contacts for CFL: {}", cflEmpId);
        return ResponseEntity.ok(meetingService.getCflContacts(cflEmpId));
    }

    @GetMapping("/cfl/{cflEmpId}/upcoming")
    public ResponseEntity<List<MeetingResponse>> getUpcomingMeetings(@PathVariable Long cflEmpId) {
        log.info("REST request to get upcoming meetings for CFL: {}", cflEmpId);
        return ResponseEntity.ok(meetingService.getUpcomingMeetings(cflEmpId));
    }

    @GetMapping("/cfl/{cflEmpId}/history")
    public ResponseEntity<List<MeetingResponse>> getHistoryMeetings(@PathVariable Long cflEmpId) {
        log.info("REST request to get meeting history for CFL: {}", cflEmpId);
        return ResponseEntity.ok(meetingService.getHistoryMeetings(cflEmpId));
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> scheduleMeeting(@RequestBody MeetingCreateRequest request) {
        log.info("REST request to schedule meeting for CFL: {}", request.getCflEmpId());
        return ResponseEntity.ok(meetingService.scheduleMeeting(request));
    }

    @PutMapping("/{meetingId}/status")
    public ResponseEntity<MeetingResponse> updateMeetingStatus(
            @PathVariable Long meetingId,
            @RequestParam String status) {
        log.info("REST request to update meeting {} status to {}", meetingId, status);
        return ResponseEntity.ok(meetingService.updateMeetingStatus(meetingId, status));
    }

    @PutMapping("/{meetingId}")
    public ResponseEntity<MeetingResponse> updateMeeting(
            @PathVariable Long meetingId,
            @RequestBody MeetingCreateRequest request) {
        log.info("REST request to update meeting details for ID: {}", meetingId);
        return ResponseEntity.ok(meetingService.updateMeeting(meetingId, request));
    }

    // HR Meeting Endpoints
    @GetMapping("/hr/all")
    public ResponseEntity<List<MeetingResponse>> getAllHrMeetings() {
        log.info("REST request to get all HR meetings");
        return ResponseEntity.ok(meetingService.getAllHrMeetings());
    }

    @GetMapping("/cfl-options")
    public ResponseEntity<List<Map<String, Object>>> getCflOptions() {
        log.info("REST request to get CFL dropdown options for HR meetings");
        return ResponseEntity.ok(meetingService.getCflOptions());
    }

    @PostMapping("/hr")
    public ResponseEntity<MeetingResponse> scheduleHrMeeting(@RequestBody MeetingCreateRequest request) {
        log.info("REST request for HR to schedule meeting with CFL: {}", request.getCflName());
        return ResponseEntity.ok(meetingService.scheduleHrMeeting(request));
    }

    @DeleteMapping("/{meetingId}")
    public ResponseEntity<Map<String, Object>> cancelMeeting(@PathVariable Long meetingId) {
        log.info("REST request to cancel meeting: {}", meetingId);
        meetingService.cancelMeeting(meetingId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Meeting cancelled successfully", "id", meetingId));
    }
}
