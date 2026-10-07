package StartSmart.serviceImpl;

import StartSmart.dto.CflAssignmentResponse;
import StartSmart.dto.CflOnboardRequest;
import StartSmart.entity.CflAssignment;
import StartSmart.entity.Manager;
import StartSmart.entity.Mentor;
import StartSmart.repository.CflAssignmentRepository;
import StartSmart.repository.ManagerRepository;
import StartSmart.repository.MentorRepository;
import StartSmart.repository.CflProfileRepository;
import StartSmart.repository.CflSkillRepository;
import StartSmart.repository.SkillRepository;
import StartSmart.entity.CflProfile;
import StartSmart.entity.CflSkill;
import StartSmart.entity.Skill;
import StartSmart.service.CflAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CflAssignmentServiceImpl implements CflAssignmentService {

    private final CflAssignmentRepository cflAssignmentRepository;
    private final ManagerRepository managerRepository;
    private final MentorRepository mentorRepository;
    private final CflProfileRepository cflProfileRepository;
    private final CflSkillRepository cflSkillRepository;
    private final SkillRepository skillRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.fetch.API}")
    private String employeeApiUrl;

    // Static fallback cohort database for offline/quick lookup
    private static final Map<Long, CflProfileMock> COHORT_BACKUP = new HashMap<>();

    static {
        COHORT_BACKUP.put(9085412L, new CflProfileMock("Manpreet Kaur", "manpreet@startsmart.com", "Java Developer", "SSD", "SSD", 82));
        COHORT_BACKUP.put(9085413L, new CflProfileMock("Amit Chauhan", "amit@startsmart.com", "Software Engineer", "SSD", "Digital", 48));
        COHORT_BACKUP.put(9085414L, new CflProfileMock("Rohit Verma", "rohit@startsmart.com", "UI/UX Designer", "SSD", "SSD", 95));
        COHORT_BACKUP.put(9085415L, new CflProfileMock("Yajnadutta Mishra", "yajna@startsmart.com", "Data Analyst", "SSD", "Cloud", 65));
        COHORT_BACKUP.put(9085492L, new CflProfileMock("Amulya B S", "amulya_s@cms.co.in", "Java Developer", "SSD", "SSD", 80));
        COHORT_BACKUP.put(9085493L, new CflProfileMock("Gagana C", "gagana_c@cms.co.in", "Software Engineer", "SSD", "SSD", 75));
        COHORT_BACKUP.put(9085494L, new CflProfileMock("Manoj Kumar V", "manoj_v@cms.co.in", "QA Engineer", "SSD", "SSD", 70));
        COHORT_BACKUP.put(9085444L, new CflProfileMock("Pravlin Kaur", "pravlin@startsmart.com", "Jr Developer – Java Full Stack", "SSD", "SSD", 80));
        COHORT_BACKUP.put(9085499L, new CflProfileMock("Manpreet Kaur", "manpreet.kaur@cms.co.in", "Java Developer", "SSD", "SSD", 82));
    }

    @Override
    public CflAssignmentResponse onboardCfl(CflOnboardRequest request) {
        log.info("Onboarding CFL with code: {}", request.getCflEmpCode());
        try {
            // 1. Process Manager
            Long managerCode = request.getManagerEmpCode();
            if (managerCode != null) {
                if (!managerRepository.existsById(managerCode)) {
                    log.info("Manager code {} not found. Creating new Manager record for: {}", managerCode, request.getManagerName());
                    Manager manager = Manager.builder()
                            .empCode(managerCode)
                            .name(request.getManagerName() != null ? request.getManagerName() : "Manager " + managerCode)
                            .email(request.getManagerEmail() != null ? request.getManagerEmail() : "manager" + managerCode + "@cms.co.in")
                            .build();
                    managerRepository.save(manager);
                }
            }

            // 2. Process Mentor
            Long mentorCode = request.getMentorEmpCode();
            if (mentorCode != null) {
                if (!mentorRepository.existsById(mentorCode)) {
                    log.info("Mentor code {} not found. Creating new Mentor record for: {}", mentorCode, request.getMentorName());
                    Mentor mentor = Mentor.builder()
                            .empCode(mentorCode)
                            .name(request.getMentorName() != null ? request.getMentorName() : "Mentor " + mentorCode)
                            .email(request.getMentorEmail() != null ? request.getMentorEmail() : "mentor" + mentorCode + "@cms.co.in")
                            .build();
                    mentorRepository.save(mentor);
                }
            }

            // 3. Save or Update CFL profile in Database
            if (request.getCflEmpCode() != null) {
                String name = request.getCflName();
                if (name == null || name.trim().isEmpty()) {
                    name = java.util.stream.Stream.of(request.getFirstName(), request.getMiddleName(), request.getLastName())
                            .filter(s -> s != null && !s.trim().isEmpty())
                            .collect(java.util.stream.Collectors.joining(" "));
                }
                if (name == null || name.trim().isEmpty()) {
                    name = "CFL " + request.getCflEmpCode();
                }

                CflProfile profile = cflProfileRepository.findById(request.getCflEmpCode())
                        .orElseGet(() -> CflProfile.builder().cflEmpId(request.getCflEmpCode()).build());

                profile.setName(name);
                profile.setEmail(request.getCflEmail() != null ? request.getCflEmail() : "cfl" + request.getCflEmpCode() + "@startsmart.com");
                profile.setRole(request.getRole() != null ? request.getRole() : (request.getDesignation() != null ? request.getDesignation() : "CFL Employee"));
                String bu = request.getBusinessUnit();
                if (bu == null || bu.trim().isEmpty()) {
                    bu = request.getDepartment();
                }
                if (bu == null || bu.trim().isEmpty()) {
                    bu = "SSD";
                }
                profile.setBusinessUnit(bu);
                profile.setDepartment(bu);
                if (request.getGoalProgress() != null) profile.setGoalProgress(request.getGoalProgress());
                
                profile.setFirstName(request.getFirstName());
                profile.setMiddleName(request.getMiddleName());
                profile.setLastName(request.getLastName());
                profile.setSubDepartment(request.getSubDepartment());
                profile.setDateOfJoining(request.getDateOfJoining() != null ? request.getDateOfJoining() : request.getEffectiveFrom());
                profile.setProject(request.getProject());
                profile.setProjectClassification(request.getProjectClassification());
                profile.setBuHead(request.getBuHead());
                profile.setLocation(request.getLocation());
                profile.setGender(request.getGender());
                profile.setVertical(request.getVertical());
                profile.setContactNumber(request.getContactNumber());
                profile.setSubArea(request.getSubArea());
                profile.setCategory(request.getCategory());
                profile.setSscPercentage(request.getSscPercentage());
                profile.setHscPercentage(request.getHscPercentage());
                profile.setUgPercentage(request.getUgPercentage());
                profile.setPgPercentage(request.getPgPercentage());
                profile.setInstituteName(request.getInstituteName());
                profile.setInstituteBranch(request.getInstituteBranch());
                profile.setBio(request.getBio());

                cflProfileRepository.save(profile);

                // 3b. Save Technical & Non-Technical Skills safely avoiding duplicates
                java.util.List<CflSkill> existingCflSkills = cflSkillRepository.findByCflEmpId(request.getCflEmpCode());
                java.util.Set<Long> existingSkillIds = existingCflSkills.stream()
                        .map(CflSkill::getSkillId)
                        .collect(java.util.stream.Collectors.toSet());

                if (request.getPrimaryTechSkills() != null) {
                    for (String sName : request.getPrimaryTechSkills()) {
                        if (sName == null || sName.trim().isEmpty()) continue;
                        Skill skill = skillRepository.findBySkillName(sName.trim())
                                .orElseGet(() -> skillRepository.save(Skill.builder().skillName(sName.trim()).skillType("TECHNICAL").active(true).build()));
                        if (!existingSkillIds.contains(skill.getId())) {
                            cflSkillRepository.save(CflSkill.builder()
                                    .cflEmpId(request.getCflEmpCode())
                                    .skillId(skill.getId())
                                    .proficiency("Intermediate")
                                    .experienceYears(java.math.BigDecimal.ONE)
                                    .build());
                            existingSkillIds.add(skill.getId());
                        }
                    }
                }
                if (request.getPrimaryNonTechSkills() != null) {
                    for (String sName : request.getPrimaryNonTechSkills()) {
                        if (sName == null || sName.trim().isEmpty()) continue;
                        Skill skill = skillRepository.findBySkillName(sName.trim())
                                .orElseGet(() -> skillRepository.save(Skill.builder().skillName(sName.trim()).skillType("NON_TECHNICAL").active(true).build()));
                        if (!existingSkillIds.contains(skill.getId())) {
                            cflSkillRepository.save(CflSkill.builder()
                                    .cflEmpId(request.getCflEmpCode())
                                    .skillId(skill.getId())
                                    .proficiency("Intermediate")
                                    .experienceYears(java.math.BigDecimal.ONE)
                                    .build());
                            existingSkillIds.add(skill.getId());
                        }
                    }
                }
            }

            // 4. Create or Update Assignment
            java.util.List<CflAssignment> existingAssignments = cflAssignmentRepository.findByCflEmpCode(request.getCflEmpCode());
            CflAssignment assignment;
            if (existingAssignments != null && !existingAssignments.isEmpty()) {
                assignment = existingAssignments.get(0);
                assignment.setCflEmpCode(request.getCflEmpCode());
                assignment.setHrEmpCode(request.getHrEmpCode() != null ? request.getHrEmpCode() : 1001L);
                assignment.setManagerEmpCode(managerCode);
                assignment.setMentorEmpCode(mentorCode);
                if (request.getEffectiveFrom() != null) assignment.setEffectiveFrom(request.getEffectiveFrom());
                if (request.getStatus() != null) assignment.setStatus(request.getStatus());
            } else {
                assignment = CflAssignment.builder()
                        .cflEmpCode(request.getCflEmpCode())
                        .hrEmpCode(request.getHrEmpCode() != null ? request.getHrEmpCode() : 1001L)
                        .managerEmpCode(managerCode)
                        .mentorEmpCode(mentorCode)
                        .effectiveFrom(request.getEffectiveFrom() != null ? request.getEffectiveFrom() : LocalDate.now())
                        .status(request.getStatus() != null ? request.getStatus() : "On Track")
                        .build();
            }

            CflAssignment saved = cflAssignmentRepository.save(assignment);
            log.info("CFL Assignment processed successfully with ID: {}", saved.getId());

            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Error onboarding CFL with code {}: {}", request.getCflEmpCode(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Map<String, Object> getAllAssignments(String search, String businessUnit, String department, 
                                                 String manager, String mentor, String status, int page, int size) {
        log.info("Fetching paginated/filtered CFL assignments search={} bu={} dept={} mgr={} ment={} status={} page={} size={}",
                search, businessUnit, department, manager, mentor, status, page, size);

        List<CflAssignment> assignments = cflAssignmentRepository.findAll();
        List<CflAssignmentResponse> resolved = new ArrayList<>();

        for (CflAssignment assignment : assignments) {
            resolved.add(mapToResponse(assignment));
        }

        // Apply filters in Java
        List<CflAssignmentResponse> filtered = resolved.stream()
                .filter(a -> {
                    // search query match: name, email, or empCode
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean nameMatch = a.getCflName() != null && a.getCflName().toLowerCase().contains(q);
                        boolean emailMatch = a.getCflEmail() != null && a.getCflEmail().toLowerCase().contains(q);
                        boolean codeMatch = a.getCflEmpCode() != null && String.valueOf(a.getCflEmpCode()).contains(q);
                        if (!nameMatch && !emailMatch && !codeMatch) {
                            return false;
                        }
                    }
                    // businessUnit filter
                    if (businessUnit != null && !businessUnit.equalsIgnoreCase("All")) {
                        if (a.getBusinessUnit() == null || !a.getBusinessUnit().equalsIgnoreCase(businessUnit)) {
                            return false;
                        }
                    }
                    // department filter
                    if (department != null && !department.equalsIgnoreCase("All")) {
                        boolean deptMatch = a.getDepartment() != null && a.getDepartment().equalsIgnoreCase(department);
                        boolean roleMatch = a.getRole() != null && a.getRole().equalsIgnoreCase(department);
                        if (!deptMatch && !roleMatch) {
                            return false;
                        }
                    }
                    // manager filter (matches managerName)
                    if (manager != null && !manager.equalsIgnoreCase("All")) {
                        if (a.getManagerName() == null || !a.getManagerName().equalsIgnoreCase(manager)) {
                            return false;
                        }
                    }
                    // mentor filter (matches mentorName)
                    if (mentor != null && !mentor.equalsIgnoreCase("All")) {
                        if (a.getMentorName() == null || !a.getMentorName().equalsIgnoreCase(mentor)) {
                            return false;
                        }
                    }
                    // status filter
                    if (status != null && !status.equalsIgnoreCase("All")) {
                        if (a.getStatus() == null || !a.getStatus().equalsIgnoreCase(status)) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();

        // Paginate
        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        if (totalPages == 0) {
            totalPages = 1;
        }

        int start = Math.min(page * size, totalElements);
        int end = Math.min(start + size, totalElements);

        List<CflAssignmentResponse> content = new ArrayList<>();
        if (start < totalElements) {
            content = filtered.subList(start, end);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    private CflAssignmentResponse mapToResponse(CflAssignment assignment) {
        // Find Manager name & email
        String managerName = "Unassigned";
        String managerEmail = null;
        if (assignment.getManagerEmpCode() != null) {
            java.util.Optional<Manager> mgrOpt = managerRepository.findById(assignment.getManagerEmpCode());
            if (mgrOpt.isPresent()) {
                managerName = mgrOpt.get().getName();
                managerEmail = mgrOpt.get().getEmail();
            } else {
                managerName = "Manager " + assignment.getManagerEmpCode();
                managerEmail = "manager" + assignment.getManagerEmpCode() + "@cms.co.in";
            }
        }

        // Find Mentor name, email & role
        String mentorName = "Unassigned";
        String mentorEmail = null;
        String mentorRole = "DevOps Engineer";
        if (assignment.getMentorEmpCode() != null) {
            java.util.Optional<Mentor> mntOpt = mentorRepository.findById(assignment.getMentorEmpCode());
            if (mntOpt.isPresent()) {
                mentorName = mntOpt.get().getName();
                mentorEmail = mntOpt.get().getEmail();
            } else {
                mentorName = "Mentor " + assignment.getMentorEmpCode();
                mentorEmail = "mentor" + assignment.getMentorEmpCode() + "@cms.co.in";
            }
        }

        // Default/Fallback values for CFL details
        String cflName = "CFL " + assignment.getCflEmpCode();
        String cflEmail = "cfl" + assignment.getCflEmpCode() + "@startsmart.com";
        String role = "CFL Employee";
        String department = "SSD";
        String businessUnit = "SSD";
        int goalProgress = 50;
        String subDepartment = "—";
        String location = "Bengaluru";
        String gender = "Female";
        String contactNumber = "+91 98765 43210";

        String firstName = null;
        String middleName = null;
        String lastName = null;
        LocalDate dateOfJoining = assignment.getEffectiveFrom();
        String project = "—";
        String projectClassification = "—";
        String buHead = "—";
        String vertical = "—";
        String subArea = "—";
        String category = "—";
        String sscPercentage = "—";
        String hscPercentage = "—";
        String ugPercentage = "—";
        String pgPercentage = "—";
        String instituteName = "—";
        String instituteBranch = "—";
        String bio = "Passionate about building scalable applications and learning new technologies.";

        // Try getting from database profile table first
        java.util.Optional<CflProfile> dbProfile = cflProfileRepository.findById(assignment.getCflEmpCode());
        if (dbProfile.isPresent()) {
            CflProfile profile = dbProfile.get();
            cflName = profile.getName();
            cflEmail = profile.getEmail();
            role = profile.getRole();
            department = profile.getDepartment();
            businessUnit = profile.getBusinessUnit();
            if (profile.getGoalProgress() != null) {
                goalProgress = profile.getGoalProgress();
            }
            if (profile.getSubDepartment() != null) {
                subDepartment = profile.getSubDepartment();
            }
            if (profile.getLocation() != null) {
                location = profile.getLocation();
            }
            if (profile.getGender() != null) {
                gender = profile.getGender();
            }
            if (profile.getContactNumber() != null) {
                contactNumber = profile.getContactNumber();
            }

            if (profile.getFirstName() != null) firstName = profile.getFirstName();
            if (profile.getMiddleName() != null) middleName = profile.getMiddleName();
            if (profile.getLastName() != null) lastName = profile.getLastName();
            if (profile.getDateOfJoining() != null) dateOfJoining = profile.getDateOfJoining();
            if (profile.getProject() != null) project = profile.getProject();
            if (profile.getProjectClassification() != null) projectClassification = profile.getProjectClassification();
            if (profile.getBuHead() != null) buHead = profile.getBuHead();
            if (profile.getVertical() != null) vertical = profile.getVertical();
            if (profile.getSubArea() != null) subArea = profile.getSubArea();
            if (profile.getCategory() != null) category = profile.getCategory();
            if (profile.getSscPercentage() != null) sscPercentage = profile.getSscPercentage();
            if (profile.getHscPercentage() != null) hscPercentage = profile.getHscPercentage();
            if (profile.getUgPercentage() != null) ugPercentage = profile.getUgPercentage();
            if (profile.getPgPercentage() != null) pgPercentage = profile.getPgPercentage();
            if (profile.getInstituteName() != null) instituteName = profile.getInstituteName();
            if (profile.getInstituteBranch() != null) instituteBranch = profile.getInstituteBranch();
            if (profile.getBio() != null) bio = profile.getBio();
        } 
        // Else try getting from cohort backup
        else if (COHORT_BACKUP.containsKey(assignment.getCflEmpCode())) {
            CflProfileMock backup = COHORT_BACKUP.get(assignment.getCflEmpCode());
            cflName = backup.name;
            cflEmail = backup.email;
            role = backup.role;
            department = backup.department;
            businessUnit = backup.businessUnit;
            goalProgress = backup.goalProgress;
        }
        // Else try querying external Employee API
        else {
            try {
                String url = employeeApiUrl + assignment.getCflEmpCode();
                log.info("Querying employee API at: {}", url);
                Map<?, ?> empData = restTemplate.getForObject(url, Map.class);
                if (empData != null) {
                    if (empData.containsKey("firstName")) {
                        cflName = String.valueOf(empData.get("firstName"));
                        if (empData.containsKey("lastName")) {
                            cflName += " " + empData.get("lastName");
                        }
                    } else if (empData.containsKey("name")) {
                        cflName = String.valueOf(empData.get("name"));
                    }
                    if (empData.containsKey("email")) {
                        cflEmail = String.valueOf(empData.get("email"));
                    }
                    if (empData.containsKey("designation")) {
                        role = String.valueOf(empData.get("designation"));
                    } else if (empData.containsKey("role")) {
                        role = String.valueOf(empData.get("role"));
                    }
                    if (empData.containsKey("department")) {
                        department = String.valueOf(empData.get("department"));
                    }
                    if (empData.containsKey("businessUnit")) {
                        businessUnit = String.valueOf(empData.get("businessUnit"));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch employee details from external API: {}", e.getMessage());
            }
        }

        // Fetch Skills
        List<String> techSkills = new ArrayList<>();
        List<String> nonTechSkills = new ArrayList<>();
        try {
            List<CflSkill> cflSkills = cflSkillRepository.findByCflEmpId(assignment.getCflEmpCode());
            for (CflSkill cs : cflSkills) {
                skillRepository.findById(cs.getSkillId()).ifPresent(s -> {
                    if ("NON_TECHNICAL".equalsIgnoreCase(s.getSkillType())) {
                        nonTechSkills.add(s.getSkillName());
                    } else {
                        techSkills.add(s.getSkillName());
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Error loading skills for cfl {}: {}", assignment.getCflEmpCode(), e.getMessage());
        }

        // Default tag values to mimic initial requirements if no skills set
        if (techSkills.isEmpty() && nonTechSkills.isEmpty()) {
            techSkills.addAll(List.of("Java", "Spring Boot", "React.js", "Microservices", "SQL"));
            nonTechSkills.addAll(List.of("Communication", "Teamwork", "Time Management"));
        }

        return CflAssignmentResponse.builder()
                .id(assignment.getId())
                .cflEmpCode(assignment.getCflEmpCode())
                .cflName(cflName)
                .cflEmail(cflEmail)
                .role(role)
                .department(department)
                .businessUnit(businessUnit)
                .hrEmpCode(assignment.getHrEmpCode())
                .managerEmpCode(assignment.getManagerEmpCode())
                .managerName(managerName)
                .managerEmail(managerEmail)
                .mentorEmpCode(assignment.getMentorEmpCode())
                .mentorName(mentorName)
                .mentorEmail(mentorEmail)
                .mentorRole(mentorRole)
                .effectiveFrom(assignment.getEffectiveFrom())
                .effectiveTo(assignment.getEffectiveTo())
                .status(assignment.getStatus())
                .goalProgress(goalProgress)
                .subDepartment(subDepartment)
                .location(location)
                .gender(gender)
                .contactNumber(contactNumber)
                .firstName(firstName)
                .middleName(middleName)
                .lastName(lastName)
                .dateOfJoining(dateOfJoining)
                .project(project)
                .projectClassification(projectClassification)
                .buHead(buHead)
                .vertical(vertical)
                .subArea(subArea)
                .category(category)
                .sscPercentage(sscPercentage)
                .hscPercentage(hscPercentage)
                .ugPercentage(ugPercentage)
                .pgPercentage(pgPercentage)
                .instituteName(instituteName)
                .instituteBranch(instituteBranch)
                .bio(bio)
                .technicalSkills(techSkills)
                .nonTechnicalSkills(nonTechSkills)
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public CflAssignmentResponse updateCflProfile(Long cflEmpCode, CflAssignmentResponse request) {
        log.info("Updating CFL Profile for Employee Code: {}", cflEmpCode);

        // 1. Find and update CflProfile
        CflProfile profile = cflProfileRepository.findById(cflEmpCode)
                .orElse(CflProfile.builder().cflEmpId(cflEmpCode).build());
        
        profile.setName(request.getCflName());
        profile.setEmail(request.getCflEmail());
        profile.setRole(request.getRole());
        profile.setDepartment(request.getDepartment());
        profile.setBusinessUnit(request.getBusinessUnit());
        profile.setSubDepartment(request.getSubDepartment());
        profile.setLocation(request.getLocation());
        profile.setGender(request.getGender());
        profile.setContactNumber(request.getContactNumber());
        profile.setFirstName(request.getFirstName());
        profile.setMiddleName(request.getMiddleName());
        profile.setLastName(request.getLastName());
        if (request.getDateOfJoining() != null) {
            profile.setDateOfJoining(request.getDateOfJoining());
        }
        profile.setProject(request.getProject());
        profile.setProjectClassification(request.getProjectClassification());
        profile.setBuHead(request.getBuHead());
        profile.setVertical(request.getVertical());
        profile.setSubArea(request.getSubArea());
        profile.setCategory(request.getCategory());
        profile.setSscPercentage(request.getSscPercentage());
        profile.setHscPercentage(request.getHscPercentage());
        profile.setUgPercentage(request.getUgPercentage());
        profile.setPgPercentage(request.getPgPercentage());
        profile.setInstituteName(request.getInstituteName());
        profile.setInstituteBranch(request.getInstituteBranch());
        profile.setBio(request.getBio());

        if (request.getGoalProgress() != null) {
            profile.setGoalProgress(request.getGoalProgress());
        }
        cflProfileRepository.save(profile);

        // 2. Find and update CflAssignment
        CflAssignment assignment = cflAssignmentRepository.findAll().stream()
                .filter(a -> a.getCflEmpCode().equals(cflEmpCode))
                .findFirst()
                .orElse(CflAssignment.builder().cflEmpCode(cflEmpCode).effectiveFrom(LocalDate.now()).build());

        // Resolve Manager if code/name changed
        if (request.getManagerEmpCode() != null) {
            assignment.setManagerEmpCode(request.getManagerEmpCode());
            if (!managerRepository.existsById(request.getManagerEmpCode())) {
                Manager manager = Manager.builder()
                        .empCode(request.getManagerEmpCode())
                        .name(request.getManagerName() != null ? request.getManagerName() : "Manager " + request.getManagerEmpCode())
                        .email(request.getManagerName() != null ? request.getManagerName().toLowerCase().replace(" ", "_") + "@cms.co.in" : "manager" + request.getManagerEmpCode() + "@cms.co.in")
                        .build();
                managerRepository.save(manager);
            }
        }

        // Resolve Mentor if code/name changed
        if (request.getMentorEmpCode() != null) {
            assignment.setMentorEmpCode(request.getMentorEmpCode());
            if (!mentorRepository.existsById(request.getMentorEmpCode())) {
                Mentor mentor = Mentor.builder()
                        .empCode(request.getMentorEmpCode())
                        .name(request.getMentorName() != null ? request.getMentorName() : "Mentor " + request.getMentorEmpCode())
                        .email(request.getMentorName() != null ? request.getMentorName().toLowerCase().replace(" ", "_") + "@cms.co.in" : "mentor" + request.getMentorEmpCode() + "@cms.co.in")
                        .build();
                mentorRepository.save(mentor);
            }
        }

        if (request.getStatus() != null) {
            assignment.setStatus(request.getStatus());
        }
        if (request.getEffectiveFrom() != null) {
            assignment.setEffectiveFrom(request.getEffectiveFrom());
        }
        cflAssignmentRepository.save(assignment);

        // 3. Update Skills
        // Delete existing skills mapping
        List<CflSkill> existingSkills = cflSkillRepository.findByCflEmpId(cflEmpCode);
        if (existingSkills != null && !existingSkills.isEmpty()) {
            cflSkillRepository.deleteAllInBatch(existingSkills);
            cflSkillRepository.flush();
        }

        // Process Technical Skills
        if (request.getTechnicalSkills() != null) {
            for (String sName : request.getTechnicalSkills()) {
                if (sName == null || sName.trim().isEmpty()) continue;
                Skill skill = skillRepository.findBySkillName(sName.trim())
                        .orElseGet(() -> skillRepository.save(Skill.builder().skillName(sName.trim()).skillType("TECHNICAL").active(true).build()));
                cflSkillRepository.save(CflSkill.builder()
                        .cflEmpId(cflEmpCode)
                        .skillId(skill.getId())
                        .proficiency("Intermediate")
                        .experienceYears(java.math.BigDecimal.ONE)
                        .build());
            }
        }

        // Process Non-Technical Skills
        if (request.getNonTechnicalSkills() != null) {
            for (String sName : request.getNonTechnicalSkills()) {
                if (sName == null || sName.trim().isEmpty()) continue;
                Skill skill = skillRepository.findBySkillName(sName.trim())
                        .orElseGet(() -> skillRepository.save(Skill.builder().skillName(sName.trim()).skillType("NON_TECHNICAL").active(true).build()));
                cflSkillRepository.save(CflSkill.builder()
                        .cflEmpId(cflEmpCode)
                        .skillId(skill.getId())
                        .proficiency("Intermediate")
                        .experienceYears(java.math.BigDecimal.ONE)
                        .build());
            }
        }

        return mapToResponse(assignment);
    }

    @Override
    public List<Manager> getAllManagers() {
        log.info("Fetching all registered managers");
        return managerRepository.findAll();
    }

    @Override
    public List<Mentor> getAllMentors() {
        log.info("Fetching all registered mentors");
        return mentorRepository.findAll();
    }

    @Override
    public Map<String, Object> getCflsByManager(Long managerEmpCode, String search, String year, int page, int size) {
        log.info("Fetching assignments for managerEmpCode={} search={} year={} page={} size={}",
                managerEmpCode, search, year, page, size);

        List<CflAssignment> assignments = cflAssignmentRepository.findAll();
        List<CflAssignmentResponse> resolved = new ArrayList<>();

        for (CflAssignment assignment : assignments) {
            if (assignment.getManagerEmpCode() != null && assignment.getManagerEmpCode().equals(managerEmpCode)) {
                resolved.add(mapToResponse(assignment));
            }
        }

        // Apply filters in Java
        List<CflAssignmentResponse> filtered = resolved.stream()
                .filter(a -> {
                    // search filter
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean nameMatch = a.getCflName() != null && a.getCflName().toLowerCase().contains(q);
                        boolean emailMatch = a.getCflEmail() != null && a.getCflEmail().toLowerCase().contains(q);
                        boolean codeMatch = a.getCflEmpCode() != null && String.valueOf(a.getCflEmpCode()).contains(q);
                        if (!nameMatch && !emailMatch && !codeMatch) {
                            return false;
                        }
                    }
                    // year filter
                    if (year != null && !year.trim().isEmpty() && !year.equalsIgnoreCase("All")) {
                        if (a.getEffectiveFrom() == null || !String.valueOf(a.getEffectiveFrom().getYear()).equals(year)) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();

        // Paginate
        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        if (totalPages == 0) {
            totalPages = 1;
        }

        int start = Math.min(page * size, totalElements);
        int end = Math.min(start + size, totalElements);

        List<CflAssignmentResponse> content = new ArrayList<>();
        if (start < totalElements) {
            content = filtered.subList(start, end);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    @Override
    public Map<String, Object> getCflsByMentor(Long mentorEmpCode, String search, String year, int page, int size) {
        log.info("Fetching assignments for mentorEmpCode={} search={} year={} page={} size={}",
                mentorEmpCode, search, year, page, size);

        List<CflAssignment> assignments = cflAssignmentRepository.findAll();
        List<CflAssignmentResponse> resolved = new ArrayList<>();

        for (CflAssignment assignment : assignments) {
            if (assignment.getMentorEmpCode() != null && assignment.getMentorEmpCode().equals(mentorEmpCode)) {
                resolved.add(mapToResponse(assignment));
            }
        }

        // Apply filters in Java
        List<CflAssignmentResponse> filtered = resolved.stream()
                .filter(a -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean nameMatch = a.getCflName() != null && a.getCflName().toLowerCase().contains(q);
                        boolean emailMatch = a.getCflEmail() != null && a.getCflEmail().toLowerCase().contains(q);
                        boolean codeMatch = a.getCflEmpCode() != null && String.valueOf(a.getCflEmpCode()).contains(q);
                        if (!nameMatch && !emailMatch && !codeMatch) {
                            return false;
                        }
                    }
                    if (year != null && !year.trim().isEmpty() && !year.equalsIgnoreCase("All")) {
                        if (a.getEffectiveFrom() == null || !String.valueOf(a.getEffectiveFrom().getYear()).equals(year)) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();

        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        if (totalPages == 0) totalPages = 1;

        int start = Math.min(page * size, totalElements);
        int end = Math.min(start + size, totalElements);

        List<CflAssignmentResponse> content = new ArrayList<>();
        if (start < totalElements) {
            content = filtered.subList(start, end);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    @Override
    public CflAssignmentResponse getCflByCflEmpCode(Long cflEmpCode) {
        log.info("Fetching assignment for cflEmpCode={}", cflEmpCode);
        List<CflAssignment> assignments = cflAssignmentRepository.findAll();
        for (CflAssignment assignment : assignments) {
            if (assignment.getCflEmpCode() != null && assignment.getCflEmpCode().equals(cflEmpCode)) {
                return mapToResponse(assignment);
            }
        }

        // Dropback fallback to COHORT_BACKUP
        CflProfileMock backup = COHORT_BACKUP.get(cflEmpCode);
        String name = backup != null ? backup.name : "CFL " + cflEmpCode;
        String email = backup != null ? backup.email : "cfl" + cflEmpCode + "@startsmart.com";
        String role = backup != null ? backup.role : "CFL Employee";
        String department = backup != null ? backup.department : "SSD";
        String businessUnit = backup != null ? backup.businessUnit : "SSD";
        int goalProgress = backup != null ? backup.goalProgress : 50;

        return CflAssignmentResponse.builder()
                .cflEmpCode(cflEmpCode)
                .cflName(name)
                .cflEmail(email)
                .role(role)
                .department(department)
                .businessUnit(businessUnit)
                .goalProgress(goalProgress)
                .status("ACTIVE")
                .managerName("Unassigned")
                .mentorName("Unassigned")
                .effectiveFrom(java.time.LocalDate.of(2025, 1, 1))
                .build();
    }

    private static class CflProfileMock {
        String name;
        String email;
        String role;
        String department;
        String businessUnit;
        int goalProgress;

        CflProfileMock(String name, String email, String role, String department, String businessUnit, int goalProgress) {
            this.name = name;
            this.email = email;
            this.role = role;
            this.department = department;
            this.businessUnit = businessUnit;
            this.goalProgress = goalProgress;
        }
    }
}
