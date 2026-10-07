package StartSmart.controller;

import StartSmart.dto.CflAssignmentResponse;
import StartSmart.dto.CflOnboardRequest;
import StartSmart.service.CflAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cfl-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CflAssignmentController {

    private final CflAssignmentService cflAssignmentService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAssignments(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "All") String businessUnit,
            @RequestParam(required = false, defaultValue = "All") String department,
            @RequestParam(required = false, defaultValue = "All") String manager,
            @RequestParam(required = false, defaultValue = "All") String mentor,
            @RequestParam(required = false, defaultValue = "All") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        log.info("REST request to get filtered & paginated CFL assignments");
        Map<String, Object> result = cflAssignmentService.getAllAssignments(
                search, businessUnit, department, manager, mentor, status, page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/onboard")
    public ResponseEntity<CflAssignmentResponse> onboardCfl(@RequestBody CflOnboardRequest request) {
        log.info("REST request to onboard CFL: {}", request.getCflEmpCode());
        CflAssignmentResponse response = cflAssignmentService.onboardCfl(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/managers")
    public ResponseEntity<List<StartSmart.entity.Manager>> getManagers() {
        log.info("REST request to get all managers");
        return ResponseEntity.ok(cflAssignmentService.getAllManagers());
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<StartSmart.entity.Mentor>> getMentors() {
        log.info("REST request to get all mentors");
        return ResponseEntity.ok(cflAssignmentService.getAllMentors());
    }

    @GetMapping("/manager/{managerEmpCode}")
    public ResponseEntity<Map<String, Object>> getCflsByManager(
            @PathVariable Long managerEmpCode,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "All") String year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        log.info("REST request to get CFLs for manager: {}", managerEmpCode);
        Map<String, Object> result = cflAssignmentService.getCflsByManager(managerEmpCode, search, year, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/mentor/{mentorEmpCode}")
    public ResponseEntity<Map<String, Object>> getCflsByMentor(
            @PathVariable Long mentorEmpCode,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "All") String year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("REST request to get CFLs for mentor: {}", mentorEmpCode);
        Map<String, Object> result = cflAssignmentService.getCflsByMentor(mentorEmpCode, search, year, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cfl/{cflEmpCode}")
    public ResponseEntity<CflAssignmentResponse> getCflByCflEmpCode(@PathVariable Long cflEmpCode) {
        log.info("REST request to get assignment for CFL: {}", cflEmpCode);
        CflAssignmentResponse response = cflAssignmentService.getCflByCflEmpCode(cflEmpCode);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cfl/{cflEmpCode}/profile")
    public ResponseEntity<CflAssignmentResponse> updateCflProfile(
            @PathVariable Long cflEmpCode,
            @RequestBody CflAssignmentResponse request) {
        log.info("REST request to update profile for CFL: {}", cflEmpCode);
        CflAssignmentResponse response = cflAssignmentService.updateCflProfile(cflEmpCode, request);
        return ResponseEntity.ok(response);
    }
}
