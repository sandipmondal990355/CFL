package StartSmart.serviceImpl;

import StartSmart.dto.*;
import StartSmart.entity.*;
import StartSmart.repository.*;
import StartSmart.service.MentoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentoringServiceImpl implements MentoringService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final FeedbackRepository feedbackRepository;
    private final MentorRepository mentorRepository;
    private final CflAssignmentRepository cflAssignmentRepository;

    @Override
    public MentoringSessionsResponse getMentoringSessions(Long cflEmpId) {
        log.info("Fetching mentoring sessions for CFL: {}", cflEmpId);

        List<Meeting> meetings = meetingRepository.findAll().stream()
                .filter(m -> isMentoringMeeting(m) && isParticipantOrCreator(m, cflEmpId))
                .collect(Collectors.toList());

        List<MentoringSessionDto> plannedSessions = new ArrayList<>();
        List<MentoringSessionDto> completedSessions = new ArrayList<>();

        if (meetings.isEmpty()) {
            return seedDefaultMentoringSessions(cflEmpId);
        }

        for (Meeting m : meetings) {
            MentoringSessionDto dto = mapToMentoringSessionDto(m, cflEmpId);
            if ("COMPLETED".equalsIgnoreCase(m.getStatus())) {
                completedSessions.add(dto);
            } else {
                plannedSessions.add(dto);
            }
        }

        return MentoringSessionsResponse.builder()
                .plannedSessions(plannedSessions)
                .completedSessions(completedSessions)
                .build();
    }

    @Override
    public MentorDetailsResponse getMentorDetails(Long cflEmpId) {
        log.info("Fetching mentor details for CFL: {}", cflEmpId);

        String mentorName = "Rohit Verma";
        String mentorEmail = "rohit.verma@cms.com";
        String mentorTitle = "DevOps Engineer";
        String initials = "RV";

        List<CflAssignment> assignments = cflAssignmentRepository.findByCflEmpCode(cflEmpId);
        if (assignments != null && !assignments.isEmpty()) {
            CflAssignment assignment = assignments.get(0);
            if (assignment.getMentorEmpCode() != null) {
                Optional<Mentor> mOpt = mentorRepository.findById(assignment.getMentorEmpCode());
                if (mOpt.isPresent()) {
                    mentorName = mOpt.get().getName();
                    mentorEmail = mOpt.get().getEmail();
                    initials = getInitials(mentorName);
                }
            }
        }

        MentoringSessionsResponse sessions = getMentoringSessions(cflEmpId);
        int plannedCount = sessions.getPlannedSessions() != null ? sessions.getPlannedSessions().size() : 0;
        int completedCount = sessions.getCompletedSessions() != null ? sessions.getCompletedSessions().size() : 0;
        int totalSessions = plannedCount + completedCount;

        double avgRating = 5.0;
        if (sessions.getCompletedSessions() != null && !sessions.getCompletedSessions().isEmpty()) {
            double sum = 0;
            int ratedCount = 0;
            for (MentoringSessionDto session : sessions.getCompletedSessions()) {
                if (session.getCflFeedback() != null && session.getCflFeedback().isSubmitted() && session.getCflFeedback().getRating() > 0) {
                    sum += session.getCflFeedback().getRating();
                    ratedCount++;
                }
            }
            if (ratedCount > 0) {
                avgRating = Math.round((sum / ratedCount) * 10.0) / 10.0;
            }
        }

        return MentorDetailsResponse.builder()
                .mentorName(mentorName)
                .mentorTitle(mentorTitle)
                .mentorEmail(mentorEmail)
                .initials(initials)
                .totalSessions(totalSessions)
                .completedSessions(completedCount)
                .plannedSessions(plannedCount)
                .yourAvgRating(avgRating)
                .build();
    }

    @Override
    @Transactional
    public MentoringSessionDto markSessionCompleted(Long sessionId) {
        log.info("Marking session {} as completed", sessionId);
        Optional<Meeting> meetingOpt = meetingRepository.findById(sessionId);
        if (meetingOpt.isPresent()) {
            Meeting meeting = meetingOpt.get();
            meeting.setStatus("COMPLETED");
            meeting.setCompletedAt(LocalDateTime.now());
            Meeting saved = meetingRepository.save(meeting);
            return mapToMentoringSessionDto(saved, saved.getCreatedBy());
        }

        return MentoringSessionDto.builder()
                .id(sessionId)
                .status("Completed")
                .feedbackComplete(false)
                .cflFeedback(FeedbackDetailsDto.builder().submitted(false).build())
                .mentorFeedback(FeedbackDetailsDto.builder().submitted(false).build())
                .build();
    }

    @Override
    @Transactional
    public MentoringSessionDto submitCflFeedback(Long sessionId, CflFeedbackRequest request) {
        log.info("Submitting CFL feedback for session {}: rating {}", sessionId, request.getRating());

        Feedback feedback = Feedback.builder()
                .meetingId(sessionId)
                .fromEmpId(request.getCflEmpId() != null ? request.getCflEmpId() : 9085414L)
                .toEmpId(101L)
                .feedbackType("CFL_FEEDBACK")
                .rating(BigDecimal.valueOf(request.getRating()))
                .comments(request.getFeedbackText() != null ? request.getFeedbackText() : "Great session")
                .createdAt(LocalDateTime.now())
                .build();

        feedbackRepository.save(feedback);

        List<String> tags = request.getTags() != null && !request.getTags().isEmpty() ? request.getTags() : Arrays.asList("Technical Expertise", "Guidance");

        FeedbackDetailsDto cflFeedback = FeedbackDetailsDto.builder()
                .submitted(true)
                .rating(request.getRating())
                .date(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .text(request.getFeedbackText())
                .tags(tags)
                .build();

        return MentoringSessionDto.builder()
                .id(sessionId)
                .status("Completed")
                .feedbackComplete(true)
                .cflFeedback(cflFeedback)
                .build();
    }

    private boolean isMentoringMeeting(Meeting m) {
        if (m.getMeetingType() != null && m.getMeetingType().toLowerCase().contains("mentor")) {
            return true;
        }
        if (m.getTitle() != null && m.getTitle().toLowerCase().contains("mentor")) {
            return true;
        }
        return false;
    }

    private boolean isParticipantOrCreator(Meeting m, Long cflEmpId) {
        if (m.getCreatedBy() != null && m.getCreatedBy().equals(cflEmpId)) {
            return true;
        }
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(m.getId());
        return participants.stream().anyMatch(p -> p.getEmpId().equals(cflEmpId));
    }

    private MentoringSessionDto mapToMentoringSessionDto(Meeting m, Long cflEmpId) {
        LocalDateTime scheduled = m.getScheduledAt() != null ? m.getScheduledAt() : LocalDateTime.now().plusDays(7);
        String dateStr = scheduled.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        String countdown = getCountdownString(scheduled);

        String createdBy = (m.getCreatedBy() != null && m.getCreatedBy().equals(cflEmpId)) ? "You" : "Mentor";

        List<Feedback> feedbacks = feedbackRepository.findAll().stream()
                .filter(f -> f.getMeetingId() != null && f.getMeetingId().equals(m.getId()))
                .collect(Collectors.toList());

        FeedbackDetailsDto mentorFeedback = FeedbackDetailsDto.builder().submitted(false).build();
        FeedbackDetailsDto cflFeedback = FeedbackDetailsDto.builder().submitted(false).build();

        for (Feedback f : feedbacks) {
            FeedbackDetailsDto dto = FeedbackDetailsDto.builder()
                    .submitted(true)
                    .rating(f.getRating() != null ? f.getRating().intValue() : 5)
                    .date(f.getCreatedAt() != null ? f.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "Today")
                    .text(f.getComments())
                    .tags(Arrays.asList("Guidance", "Technical Expertise"))
                    .build();

            if ("MENTOR_FEEDBACK".equalsIgnoreCase(f.getFeedbackType())) {
                mentorFeedback = dto;
            } else {
                cflFeedback = dto;
            }
        }

        boolean feedbackComplete = mentorFeedback.isSubmitted() && cflFeedback.isSubmitted();

        return MentoringSessionDto.builder()
                .id(m.getId())
                .dateTimeStr(dateStr)
                .countdown(countdown)
                .status("COMPLETED".equalsIgnoreCase(m.getStatus()) ? "Completed" : "Planned")
                .topic(m.getTitle() != null ? m.getTitle() : "Mentoring Session")
                .mode(m.getMode() != null ? m.getMode() : "Zoom")
                .createdBy(createdBy)
                .meetingUrl(m.getMeetingLink() != null ? m.getMeetingLink() : "https://zoom.us/j/9876543210")
                .feedbackComplete(feedbackComplete)
                .mentorFeedback(mentorFeedback)
                .cflFeedback(cflFeedback)
                .build();
    }

    private String getCountdownString(LocalDateTime scheduled) {
        long days = ChronoUnit.DAYS.between(LocalDateTime.now().toLocalDate(), scheduled.toLocalDate());
        if (days <= 0) return "Today";
        if (days == 1) return "Tomorrow";
        return "In " + days + " days";
    }

    private String getInitials(String name) {
        if (name == null || name.isBlank()) return "RV";
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) {
            return ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return name.substring(0, Math.min(2, name.length())).toUpperCase();
    }

    private MentoringSessionsResponse seedDefaultMentoringSessions(Long cflEmpId) {
        MentoringSessionDto p1 = MentoringSessionDto.builder()
                .id(1L)
                .dateTimeStr("22 May 2026, 03:00 PM")
                .countdown("In 7 days")
                .status("Planned")
                .topic("Quarterly Goal Discussion")
                .mode("Zoom")
                .createdBy("Mentor")
                .meetingUrl("https://zoom.us/j/9876543210")
                .build();

        MentoringSessionDto p2 = MentoringSessionDto.builder()
                .id(2L)
                .dateTimeStr("29 May 2026, 11:30 AM")
                .countdown("In 14 days")
                .status("Planned")
                .topic("Mid-Quarter Check-in")
                .mode("Google Meet")
                .createdBy("You")
                .meetingUrl("https://meet.google.com/abc-defg-hij")
                .build();

        MentoringSessionDto c1 = MentoringSessionDto.builder()
                .id(101L)
                .dateTimeStr("15 May 2026, 10:00 AM")
                .topic("Career Growth Discussion")
                .mode("Zoom")
                .createdBy("Mentor")
                .feedbackComplete(true)
                .status("Completed")
                .mentorFeedback(FeedbackDetailsDto.builder()
                        .submitted(true)
                        .rating(4)
                        .date("15 May 2026")
                        .text("Manpreet is consistently improving her technical skills. She asks relevant questions and shows good initiative in solving problems.")
                        .tags(Arrays.asList("Technical Skills", "Problem Solving", "Communication"))
                        .build())
                .cflFeedback(FeedbackDetailsDto.builder()
                        .submitted(true)
                        .rating(5)
                        .date("15 May 2026")
                        .text("Rohit is an excellent mentor. He explains technical concepts clearly and shares real-time examples which helps me a lot in understanding. His guidance is very valuable.")
                        .tags(Arrays.asList("Technical Expertise", "Guidance", "Availability"))
                        .build())
                .build();

        MentoringSessionDto c2 = MentoringSessionDto.builder()
                .id(102L)
                .dateTimeStr("01 May 2026, 02:00 PM")
                .topic("Sprint Retrospective & Growth Areas")
                .mode("Google Meet")
                .createdBy("You")
                .feedbackComplete(false)
                .status("Completed")
                .mentorFeedback(FeedbackDetailsDto.builder()
                        .submitted(true)
                        .rating(4)
                        .date("01 May 2026")
                        .text("Good progress on the assigned module this sprint. Keep up the momentum and document your learnings.")
                        .tags(Arrays.asList("Ownership", "Documentation"))
                        .build())
                .cflFeedback(FeedbackDetailsDto.builder()
                        .submitted(false)
                        .rating(0)
                        .date("")
                        .text("")
                        .tags(Collections.emptyList())
                        .build())
                .build();

        MentoringSessionDto c3 = MentoringSessionDto.builder()
                .id(103L)
                .dateTimeStr("17 Apr 2026, 04:00 PM")
                .topic("Onboarding Check-in")
                .mode("In-Person")
                .createdBy("Mentor")
                .feedbackComplete(false)
                .status("Completed")
                .mentorFeedback(FeedbackDetailsDto.builder()
                        .submitted(false)
                        .rating(0)
                        .date("")
                        .text("")
                        .tags(Collections.emptyList())
                        .build())
                .cflFeedback(FeedbackDetailsDto.builder()
                        .submitted(false)
                        .rating(0)
                        .date("")
                        .text("")
                        .tags(Collections.emptyList())
                        .build())
                .build();

        return MentoringSessionsResponse.builder()
                .plannedSessions(Arrays.asList(p1, p2))
                .completedSessions(Arrays.asList(c1, c2, c3))
                .build();
    }
}