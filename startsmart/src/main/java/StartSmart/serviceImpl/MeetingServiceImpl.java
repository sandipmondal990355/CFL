package StartSmart.serviceImpl;

import StartSmart.dto.CflContactInfoResponse;
import StartSmart.dto.MeetingCreateRequest;
import StartSmart.dto.MeetingResponse;
import StartSmart.entity.*;
import StartSmart.repository.*;
import StartSmart.service.MeetingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final CflAssignmentRepository cflAssignmentRepository;
    private final CflProfileRepository cflProfileRepository;
    private final ManagerRepository managerRepository;
    private final MentorRepository mentorRepository;

    @Override
    public CflContactInfoResponse getCflContacts(Long cflEmpId) {
        log.info("Fetching contacts for CFL: {}", cflEmpId);

        Optional<CflProfile> profileOpt = cflProfileRepository.findById(cflEmpId);
        String cflName = "CFL " + cflEmpId;
        String cflEmail = "cfl" + cflEmpId + "@startsmart.com";
        String mentorName = "Rohit Verma";
        String mentorEmail = "rohit.verma@cms.co.in";
        String mentorDept = "SSD";
        String managerName = "Amit Chauhan";
        String managerEmail = "amit.chauhan@cms.co.in";
        String managerDept = "SSD";
        String hrName = "HR Admin";
        String hrEmail = "hr.admin@cms.co.in";
        String hrLocation = "Bengaluru";

        if (profileOpt.isPresent()) {
            CflProfile profile = profileOpt.get();
            String nameFromProfile = buildFullName(profile.getFirstName(), profile.getMiddleName(), profile.getLastName());
            if (nameFromProfile != null && !nameFromProfile.isBlank()) {
                cflName = nameFromProfile;
            } else if (profile.getName() != null && !profile.getName().isBlank()) {
                cflName = profile.getName();
            }
            if (profile.getEmail() != null) {
                cflEmail = profile.getEmail();
            }
        }

        List<CflAssignment> assignments = cflAssignmentRepository.findByCflEmpCode(cflEmpId);
        if (assignments != null && !assignments.isEmpty()) {
            CflAssignment assignment = assignments.get(0);
            if (assignment.getMentorEmpCode() != null) {
                Optional<Mentor> mentorOpt = mentorRepository.findById(assignment.getMentorEmpCode());
                if (mentorOpt.isPresent()) {
                    mentorName = mentorOpt.get().getName();
                    mentorEmail = mentorOpt.get().getEmail();
                }
            }
            if (assignment.getManagerEmpCode() != null) {
                Optional<Manager> managerOpt = managerRepository.findById(assignment.getManagerEmpCode());
                if (managerOpt.isPresent()) {
                    managerName = managerOpt.get().getName();
                    managerEmail = managerOpt.get().getEmail();
                }
            }
        }

        return CflContactInfoResponse.builder()
                .cflEmpId(cflEmpId)
                .cflName(cflName)
                .cflEmail(cflEmail)
                .mentorName(mentorName)
                .mentorEmail(mentorEmail)
                .mentorDepartment(mentorDept)
                .managerName(managerName)
                .managerEmail(managerEmail)
                .managerDepartment(managerDept)
                .hrName(hrName)
                .hrEmail(hrEmail)
                .hrLocation(hrLocation)
                .build();
    }

    @Override
    public List<MeetingResponse> getUpcomingMeetings(Long cflEmpId) {
        log.info("Fetching upcoming meetings for CFL: {}", cflEmpId);
        List<Meeting> allMeetings = meetingRepository.findAll();
        List<MeetingResponse> responses = new ArrayList<>();

        for (Meeting m : allMeetings) {
            if (isParticipantOrCreator(m, cflEmpId) && !"COMPLETED".equalsIgnoreCase(m.getStatus()) && !"CANCELLED".equalsIgnoreCase(m.getStatus())) {
                responses.add(mapToResponse(m, cflEmpId));
            }
        }

        return responses;
    }

    @Override
    public List<MeetingResponse> getHistoryMeetings(Long cflEmpId) {
        log.info("Fetching meeting history for CFL: {}", cflEmpId);
        List<Meeting> allMeetings = meetingRepository.findAll();
        List<MeetingResponse> responses = new ArrayList<>();

        for (Meeting m : allMeetings) {
            if (isParticipantOrCreator(m, cflEmpId) && "COMPLETED".equalsIgnoreCase(m.getStatus())) {
                responses.add(mapToResponse(m, cflEmpId));
            }
        }

        return responses;
    }

    @Override
    @Transactional
    public MeetingResponse scheduleMeeting(MeetingCreateRequest request) {
        log.info("Scheduling meeting request for CFL: {}", request.getCflEmpId());

        Long cflEmpId = request.getCflEmpId() != null ? request.getCflEmpId() : 9085173L;
        LocalDate date = parseDate(request.getMeetingDate());
        LocalTime time = parseTime(request.getMeetingTime());
        LocalDateTime scheduledAt = LocalDateTime.of(date, time);

        String person = request.getSelectedPerson() != null ? request.getSelectedPerson() : "Mentor";
        String type = request.getMeetingType() != null ? request.getMeetingType() : "1:1 Discussion";
        String title = type + " - " + person;

        Meeting meeting = Meeting.builder()
                .meetingType(type)
                .title(title)
                .agenda(request.getAgenda())
                .scheduledAt(scheduledAt)
                .durationMinutes(30)
                .mode(request.getMeetingMode() != null ? request.getMeetingMode() : "Zoom")
                .meetingLink(request.getMeetingLink() != null && !request.getMeetingLink().isBlank() ? request.getMeetingLink() : "https://zoom.us/j/demo-meeting")
                .status("SCHEDULED")
                .createdBy(cflEmpId)
                .createdFor(cflEmpId)
                .build();

        Meeting saved = meetingRepository.save(meeting);

        MeetingParticipant participant = MeetingParticipant.builder()
                .meetingId(saved.getId())
                .empId(cflEmpId)
                .participantRole("CFL")
                .responseStatus("ACCEPTED")
                .joinedAt(LocalDateTime.now())
                .build();
        participantRepository.save(participant);

        return mapToResponse(saved, cflEmpId);
    }

    @Override
    @Transactional
    public MeetingResponse updateMeetingStatus(Long meetingId, String status) {
        log.info("Updating meeting status for meetingId: {} to {}", meetingId, status);
        Optional<Meeting> opt = meetingRepository.findById(meetingId);
        if (opt.isPresent()) {
            Meeting meeting = opt.get();
            meeting.setStatus(status.toUpperCase());
            if ("COMPLETED".equalsIgnoreCase(status)) {
                meeting.setCompletedAt(LocalDateTime.now());
            }
            Meeting saved = meetingRepository.save(meeting);
            return mapToHrResponse(saved);
        }
        return MeetingResponse.builder()
                .id(meetingId)
                .status(status.toUpperCase())
                .build();
    }

    @Override
    @Transactional
    public MeetingResponse updateMeeting(Long meetingId, MeetingCreateRequest request) {
        log.info("Updating meeting details for meetingId: {}", meetingId);
        Optional<Meeting> opt = meetingRepository.findById(meetingId);
        if (opt.isPresent()) {
            Meeting meeting = opt.get();
            if (request.getMeetingType() != null && !request.getMeetingType().isBlank()) {
                meeting.setMeetingType(request.getMeetingType());
            }
            if (request.getCflName() != null || request.getSelectedPerson() != null) {
                String person = request.getCflName() != null ? request.getCflName() : request.getSelectedPerson();
                meeting.setTitle(meeting.getMeetingType() + " with " + person);
            }
            if (request.getAgenda() != null) {
                meeting.setAgenda(request.getAgenda());
            }
            if (request.getMeetingMode() != null) {
                meeting.setMode(request.getMeetingMode());
            }
            if (request.getMeetingLink() != null) {
                meeting.setMeetingLink(request.getMeetingLink());
            }
            if (request.getMeetingDate() != null && request.getMeetingTime() != null) {
                LocalDate date = parseDate(request.getMeetingDate());
                LocalTime time = parseTime(request.getMeetingTime());
                meeting.setScheduledAt(LocalDateTime.of(date, time));
            }
            Meeting saved = meetingRepository.save(meeting);
            return mapToHrResponse(saved);
        }
        return mapToHrResponse(Meeting.builder()
                .id(meetingId)
                .title((request.getMeetingType() != null ? request.getMeetingType() : "HR Meeting") + " with " + (request.getCflName() != null ? request.getCflName() : "CFL"))
                .agenda(request.getAgenda())
                .mode(request.getMeetingMode() != null ? request.getMeetingMode() : "Zoom")
                .meetingLink(request.getMeetingLink())
                .status("SCHEDULED")
                .scheduledAt(LocalDateTime.of(parseDate(request.getMeetingDate()), parseTime(request.getMeetingTime())))
                .build());
    }

    // HR Meeting Operations
    @Override
    public List<MeetingResponse> getAllHrMeetings() {
        log.info("Fetching all HR meetings");
        List<Meeting> allMeetings = meetingRepository.findAll();
        List<MeetingResponse> responses = new ArrayList<>();

        for (Meeting m : allMeetings) {
            if (!"CANCELLED".equalsIgnoreCase(m.getStatus())) {
                responses.add(mapToHrResponse(m));
            }
        }

        if (responses.isEmpty()) {
            return seedDefaultHrMeetings();
        }

        return responses;
    }

    @Override
    public List<Map<String, Object>> getCflOptions() {
        log.info("Fetching CFL dropdown options for HR meetings");
        List<CflProfile> profiles = cflProfileRepository.findAll();
        List<Map<String, Object>> options = new ArrayList<>();

        if (profiles != null && !profiles.isEmpty()) {
            for (CflProfile p : profiles) {
                String name = buildFullName(p.getFirstName(), p.getMiddleName(), p.getLastName());
                if (name == null || name.isBlank()) name = p.getName() != null ? p.getName() : "CFL " + p.getCflEmpId();
                Map<String, Object> map = new HashMap<>();
                map.put("empCode", "CFL" + p.getCflEmpId());
                map.put("empId", p.getCflEmpId());
                map.put("name", name);
                map.put("email", p.getEmail());
                map.put("department", p.getDepartment());
                options.add(map);
            }
            return options;
        }

        // Fallback to default list of CFLs
        String[] defaultNames = {
            "Manpreet Kaur", "Amit Chauhan", "Yajnadutta Mishra", "Rohit Verma",
            "Sneha Reddy", "Shalini", "Amulya", "Abhishek", "John Doe"
        };
        for (int i = 0; i < defaultNames.length; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("empCode", "CFL90854" + (14 + i));
            map.put("empId", 9085414L + i);
            map.put("name", defaultNames[i]);
            map.put("email", defaultNames[i].toLowerCase().replace(" ", ".") + "@startsmart.com");
            map.put("department", "Engineering");
            options.add(map);
        }

        return options;
    }

    @Override
    @Transactional
    public MeetingResponse scheduleHrMeeting(MeetingCreateRequest request) {
        log.info("HR Scheduling meeting with CFL: {}", request.getCflName());

        String cflName = request.getCflName() != null ? request.getCflName() : "CFL Employee";
        String type = request.getMeetingType() != null && !request.getMeetingType().isBlank() ? request.getMeetingType() : "HR Discussion";
        String title = type + " with " + cflName;

        LocalDate date = parseDate(request.getMeetingDate());
        LocalTime time = parseTime(request.getMeetingTime());
        LocalDateTime scheduledAt = LocalDateTime.of(date, time);

        Meeting meeting = Meeting.builder()
                .meetingType(type)
                .title(title)
                .agenda(request.getAgenda())
                .scheduledAt(scheduledAt)
                .durationMinutes(30)
                .mode(request.getMeetingMode() != null ? request.getMeetingMode() : "Zoom")
                .meetingLink(request.getMeetingLink() != null && !request.getMeetingLink().isBlank() ? request.getMeetingLink() : "https://zoom.us/j/hr-meeting-room")
                .status("SCHEDULED")
                .createdBy(9085400L) // HR Admin ID
                .createdFor(request.getCflEmpId() != null ? request.getCflEmpId() : 9085173L)
                .build();

        Meeting saved = meetingRepository.save(meeting);

        MeetingResponse resp = mapToHrResponse(saved);
        resp.setCflName(cflName);
        return resp;
    }

    @Override
    @Transactional
    public void cancelMeeting(Long meetingId) {
        log.info("Cancelling HR meeting: {}", meetingId);
        Optional<Meeting> opt = meetingRepository.findById(meetingId);
        if (opt.isPresent()) {
            Meeting m = opt.get();
            m.setStatus("CANCELLED");
            meetingRepository.save(m);
        }
    }

    private MeetingResponse mapToHrResponse(Meeting m) {
        LocalDateTime scheduled = m.getScheduledAt();
        String dateStr = scheduled != null ? scheduled.toLocalDate().toString() : LocalDate.now().toString();
        int day = scheduled != null ? scheduled.getDayOfMonth() : LocalDate.now().getDayOfMonth();
        String month = scheduled != null ? scheduled.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase() : "MAY";
        int year = scheduled != null ? scheduled.getYear() : 2026;

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        String formattedTime = scheduled != null ? scheduled.toLocalTime().format(timeFormatter) : "10:30 AM";

        String cflName = extractPersonName(m.getTitle());

        return MeetingResponse.builder()
                .id(m.getId())
                .date(dateStr)
                .day(day)
                .month(month)
                .year(year)
                .title(m.getTitle())
                .time(formattedTime)
                .mode(m.getMode())
                .createdByType("HR")
                .link(m.getMeetingLink() != null ? m.getMeetingLink() : "https://zoom.us/j/hr-meeting-room")
                .status(m.getStatus())
                .cflName(cflName)
                .withPerson(cflName)
                .agenda(m.getAgenda())
                .meetingType(m.getMeetingType() != null ? m.getMeetingType() : "HR Discussion")
                .build();
    }

    private boolean isParticipantOrCreator(Meeting m, Long cflEmpId) {
        if (m.getCreatedBy() != null && m.getCreatedBy().equals(cflEmpId)) {
            return true;
        }
        if (m.getCreatedFor() != null && m.getCreatedFor().equals(cflEmpId)) {
            return true;
        }
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(m.getId());
        return participants.stream().anyMatch(p -> p.getEmpId().equals(cflEmpId));
    }

    private MeetingResponse mapToResponse(Meeting m, Long cflEmpId) {
        LocalDateTime scheduled = m.getScheduledAt();
        String dateStr = scheduled != null ? scheduled.toLocalDate().toString() : LocalDate.now().toString();
        int day = scheduled != null ? scheduled.getDayOfMonth() : LocalDate.now().getDayOfMonth();
        String month = scheduled != null ? scheduled.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase() : "MAY";
        int year = scheduled != null ? scheduled.getYear() : 2026;

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        String formattedTime = scheduled != null ? scheduled.toLocalTime().format(timeFormatter) : "10:30 AM";

        String createdByType = (m.getCreatedBy() != null && m.getCreatedBy().equals(cflEmpId)) ? "You" : "Mentor";
        if (m.getTitle() != null) {
            if (m.getTitle().contains("Manager")) createdByType = "Manager";
            else if (m.getTitle().contains("HR")) createdByType = "HR";
        }

        return MeetingResponse.builder()
                .id(m.getId())
                .date(dateStr)
                .day(day)
                .month(month)
                .year(year)
                .title(m.getTitle())
                .time(formattedTime)
                .mode(m.getMode())
                .createdByType(createdByType)
                .link(m.getMeetingLink() != null ? m.getMeetingLink() : "https://zoom.us/j/demo-meeting")
                .status("COMPLETED".equalsIgnoreCase(m.getStatus()) ? "Completed" : m.getStatus())
                .agenda(m.getAgenda())
                .meetingType(m.getMeetingType() != null ? m.getMeetingType() : "1:1 Discussion")
                .withPerson(extractPersonName(m.getTitle()))
                .build();
    }

    private String extractPersonName(String title) {
        if (title != null && (title.contains(" - ") || title.contains(" with "))) {
            String[] parts = title.split(" - | with ");
            if (parts.length > 1) {
                return parts[1].trim();
            }
        }
        return title;
    }

    private String buildFullName(String first, String middle, String last) {
        StringBuilder sb = new StringBuilder();
        if (first != null && !first.isBlank()) sb.append(first.trim());
        if (middle != null && !middle.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(middle.trim());
        }
        if (last != null && !last.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(last.trim());
        }
        return sb.toString();
    }

    private LocalDate parseDate(String dateStr) {
        try {
            if (dateStr != null && !dateStr.isBlank()) {
                return LocalDate.parse(dateStr);
            }
        } catch (Exception e) {
            log.warn("Could not parse date '{}', defaulting to today", dateStr);
        }
        return LocalDate.now().plusDays(7);
    }

    private LocalTime parseTime(String timeStr) {
        try {
            if (timeStr != null && !timeStr.isBlank()) {
                String[] parts = timeStr.split(":");
                if (parts.length >= 2) {
                    int hrs = Integer.parseInt(parts[0]);
                    int mins = Integer.parseInt(parts[1].substring(0, 2));
                    return LocalTime.of(hrs, mins);
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse time '{}', defaulting to 15:00", timeStr);
        }
        return LocalTime.of(15, 0);
    }

    private List<MeetingResponse> seedDefaultUpcomingMeetings(Long cflEmpId) {
        CflContactInfoResponse contacts = getCflContacts(cflEmpId);
        LocalDate today = LocalDate.now();

        MeetingResponse m1 = MeetingResponse.builder()
                .id(1L)
                .date(today.toString())
                .day(today.getDayOfMonth())
                .month(today.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase())
                .year(today.getYear())
                .title("Mentoring Session - " + contacts.getMentorName())
                .meetingType("Mentoring Session")
                .time("04:30 PM")
                .mode("Zoom")
                .createdByType("Mentor")
                .link("https://zoom.us/j/123456789")
                .status("SCHEDULED")
                .withPerson(contacts.getMentorName())
                .build();

        MeetingResponse m2 = MeetingResponse.builder()
                .id(2L)
                .date(today.plusDays(7).toString())
                .day(today.plusDays(7).getDayOfMonth())
                .month(today.plusDays(7).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase())
                .year(today.plusDays(7).getYear())
                .title("Mentoring Session - " + contacts.getMentorName())
                .meetingType("Mentoring Session")
                .time("11:30 AM")
                .mode("Google Meet")
                .createdByType("You")
                .link("https://meet.google.com/abc-defg-hij")
                .status("SCHEDULED")
                .withPerson(contacts.getMentorName())
                .build();

        return Arrays.asList(m1, m2);
    }

    private List<MeetingResponse> seedDefaultHistoryMeetings(Long cflEmpId) {
        CflContactInfoResponse contacts = getCflContacts(cflEmpId);

        MeetingResponse h1 = MeetingResponse.builder()
                .id(101L)
                .day(1)
                .month("MAY")
                .year(2026)
                .date("2026-05-01")
                .title("1:1 Discussion")
                .meetingType("1:1 Discussion")
                .withPerson(contacts.getManagerName() + " (Manager)")
                .time("11:00 AM")
                .mode("Google Meet")
                .createdByType("Manager")
                .status("Completed")
                .build();

        MeetingResponse h2 = MeetingResponse.builder()
                .id(102L)
                .day(5)
                .month("MAY")
                .year(2026)
                .date("2026-05-05")
                .title("Document Submission")
                .meetingType("Document Submission")
                .withPerson(contacts.getHrName() + " (HR)")
                .time("02:00 PM")
                .mode("In-Person")
                .createdByType("HR")
                .status("Completed")
                .build();

        return Arrays.asList(h1, h2);
    }

    private List<MeetingResponse> seedDefaultHrMeetings() {
        MeetingResponse m1 = MeetingResponse.builder()
                .id(201L)
                .cflName("Manpreet Kaur")
                .cflEmpCode("CFL9085414")
                .meetingType("HR 1:1 Check-in")
                .title("HR 1:1 Check-in with Manpreet Kaur")
                .date("2026-05-15")
                .day(15)
                .month("MAY")
                .year(2026)
                .time("10:30 AM")
                .mode("Zoom")
                .link("https://zoom.us/j/9876543210")
                .status("SCHEDULED")
                .createdByType("HR")
                .agenda("First month onboarding progress review and feedback session.")
                .build();

        MeetingResponse m2 = MeetingResponse.builder()
                .id(202L)
                .cflName("Amit Chauhan")
                .cflEmpCode("CFL9085415")
                .meetingType("Probation Milestone Discussion")
                .title("Probation Milestone Discussion with Amit Chauhan")
                .date("2026-05-20")
                .day(20)
                .month("MAY")
                .year(2026)
                .time("02:00 PM")
                .mode("Google Meet")
                .link("https://meet.google.com/abc-defg-hij")
                .status("SCHEDULED")
                .createdByType("HR")
                .agenda("Mid-probation goals evaluation and project alignment discussion.")
                .build();

        return Arrays.asList(m1, m2);
    }
}
