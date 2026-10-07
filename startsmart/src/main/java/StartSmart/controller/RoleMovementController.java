package StartSmart.controller;

import StartSmart.entity.CareerMovement;
import StartSmart.entity.CflProfile;
import StartSmart.repository.CareerMovementRepository;
import StartSmart.repository.CflProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/role-movement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class RoleMovementController {

    private final CareerMovementRepository careerMovementRepository;
    private final CflProfileRepository cflProfileRepository;

    @GetMapping("/options")
    public ResponseEntity<?> getRoleMovementOptions() {
        log.info("REST request to fetch Role Movement dropdown options");
        Map<String, Object> response = new HashMap<>();
        response.put("movementOptions", java.util.List.of(
                "Select",
                "Same Role — Deepen Expertise",
                "Lateral Move — Different Domain",
                "Vertical Promotion",
                "Cross-Functional Move",
                "Leadership Track"
        ));
        response.put("formalRoleOptions", java.util.List.of(
                "Senior DevOps Engineer",
                "Lead DevOps Engineer",
                "Senior Java Developer",
                "Tech Lead",
                "Principal Engineer",
                "Solution Architect",
                "Engineering Manager"
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{cflEmpId}")
    public ResponseEntity<?> getRoleMovement(@PathVariable Long cflEmpId) {
        log.info("REST request to fetch Role Movement for CFL: {}", cflEmpId);
        
        var cmOpt = careerMovementRepository.findByCflEmpId(cflEmpId);

        if (cmOpt.isEmpty()) {
            String designation = "CFL Employee";
            var cflOpt = cflProfileRepository.findById(cflEmpId);
            if (cflOpt.isPresent() && cflOpt.get().getRole() != null) {
                designation = cflOpt.get().getRole();
            }

            Map<String, Object> blankMap = new HashMap<>();
            blankMap.put("id", null);
            blankMap.put("cflEmpId", cflEmpId);
            blankMap.put("existingRole", designation);
            blankMap.put("formalRole", "");
            blankMap.put("currentSkills", "");
            blankMap.put("skillsGap", "");
            blankMap.put("possibleMovement", "Select");
            blankMap.put("canBeBackup", null);
            blankMap.put("backupForEmpName", "");
            blankMap.put("project1", "");
            blankMap.put("project2", "");
            blankMap.put("project3", "");
            blankMap.put("lastSavedDate", null);
            blankMap.put("isSaved", false);
            return ResponseEntity.ok(blankMap);
        }

        return ResponseEntity.ok(formatResponse(cmOpt.get()));
    }

    @PostMapping("/{cflEmpId}")
    public ResponseEntity<?> saveRoleMovement(@PathVariable Long cflEmpId, @RequestBody CareerMovement req) {
        log.info("REST request to save Role Movement for CFL: {}", cflEmpId);

        CareerMovement cm = careerMovementRepository.findByCflEmpId(cflEmpId)
                .orElseGet(() -> CareerMovement.builder().cflEmpId(cflEmpId).build());

        cm.setExistingRole(req.getExistingRole());
        cm.setFormalRole(req.getFormalRole());
        cm.setCurrentSkills(req.getCurrentSkills());
        cm.setSkillsGap(req.getSkillsGap());
        cm.setPossibleMovement(req.getPossibleMovement());
        cm.setCanBeBackup(req.getCanBeBackup());
        cm.setBackupForEmpName(req.getBackupForEmpName());
        cm.setProject1(req.getProject1());
        cm.setProject2(req.getProject2());
        cm.setProject3(req.getProject3());
        cm.setUpdatedAt(LocalDateTime.now());

        CareerMovement saved = careerMovementRepository.save(cm);
        return ResponseEntity.ok(formatResponse(saved));
    }

    private Map<String, Object> formatResponse(CareerMovement cm) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", cm.getId());
        map.put("cflEmpId", cm.getCflEmpId());
        map.put("existingRole", cm.getExistingRole() != null ? cm.getExistingRole() : "");
        map.put("formalRole", cm.getFormalRole() != null ? cm.getFormalRole() : "");
        map.put("currentSkills", cm.getCurrentSkills() != null ? cm.getCurrentSkills() : "");
        map.put("skillsGap", cm.getSkillsGap() != null ? cm.getSkillsGap() : "");
        map.put("possibleMovement", cm.getPossibleMovement() != null ? cm.getPossibleMovement() : "Select");
        map.put("canBeBackup", cm.getCanBeBackup());
        map.put("backupForEmpName", cm.getBackupForEmpName() != null ? cm.getBackupForEmpName() : "");
        map.put("project1", cm.getProject1() != null ? cm.getProject1() : "");
        map.put("project2", cm.getProject2() != null ? cm.getProject2() : "");
        map.put("project3", cm.getProject3() != null ? cm.getProject3() : "");
        map.put("isSaved", true);
        
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        LocalDateTime lastUpdated = cm.getUpdatedAt() != null ? cm.getUpdatedAt() : LocalDateTime.now();
        map.put("lastSavedDate", lastUpdated.format(fmt));

        return map;
    }
}
