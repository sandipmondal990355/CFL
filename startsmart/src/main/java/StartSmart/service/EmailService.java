package StartSmart.service;

import StartSmart.entity.EmailHistory;
import StartSmart.repository.EmailHistoryRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailHistoryRepository emailHistoryRepository;

    @Value("${spring.mail.username:manpreetkaur622495@gmail.com}")
    private String senderEmail;

    public void sendEmail(Long empId, String toEmail, String subject, String body, String emailType) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            toEmail = "manpreetkaur622495@gmail.com";
        }
        
        log.info("Preparing to send {} email to recipient: {} for empId: {}", emailType, toEmail, empId);
        String deliveryStatus = "SENT";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
            log.info("Email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            deliveryStatus = "FAILED: " + e.getMessage();
        }

        try {
            EmailHistory history = EmailHistory.builder()
                    .empId(empId != null ? empId : 0L)
                    .recipientEmail(toEmail)
                    .subject(subject)
                    .emailType(emailType)
                    .deliveryStatus(deliveryStatus)
                    .sentAt(LocalDateTime.now())
                    .build();
            emailHistoryRepository.save(history);
        } catch (Exception ex) {
            log.warn("Could not save email history record: {}", ex.getMessage());
        }
    }

    // 1. Step 1: Notify CFL when HR opens a goal setting stage for them
    public void notifyCflGoalOpened(Long cflEmpId, String cflEmail, String cflName, String stageName) {
        String subject = "StartSmart: Goal Setting Activated - " + stageName;
        String body = "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;'>"
                + "<h2 style='color: #78161A;'>StartSmart Performance Management</h2>"
                + "<p>Dear <b>" + (cflName != null ? cflName : "Employee") + "</b> (Employee ID: " + cflEmpId + "),</p>"
                + "<p>Your HR administrator has activated the goal setting process for <b>" + stageName + "</b>.</p>"
                + "<p>Please log in to your StartSmart portal to formulate and submit your SMART performance goals for review.</p>"
                + "<br/><p>Best regards,<br/><b>StartSmart HR & Performance Team</b></p>"
                + "</div>";

        sendEmail(cflEmpId, cflEmail, subject, body, "GOAL_STAGE_ENABLED");
    }

    // 2. Step 2: Notify Manager when CFL submits goals for approval
    public void notifyManagerGoalSubmitted(Long managerEmpId, String managerEmail, String managerName, Long cflEmpId, String cflName, String stageName) {
        String subject = "StartSmart: SMART Goals Submitted by " + (cflName != null ? cflName : ("CFL " + cflEmpId)) + " (" + stageName + ")";
        String body = "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;'>"
                + "<h2 style='color: #78161A;'>StartSmart Manager Portal</h2>"
                + "<p>Dear <b>" + (managerName != null ? managerName : "Manager") + "</b>,</p>"
                + "<p>Your assigned CFL <b>" + (cflName != null ? cflName : "CFL") + "</b> (Emp ID: " + cflEmpId + ") has submitted SMART performance goals for <b>" + stageName + "</b>.</p>"
                + "<p>Please access your Manager Performance Dashboard to review and approve the submitted goals or request revisions.</p>"
                + "<br/><p>Best regards,<br/><b>StartSmart HR System</b></p>"
                + "</div>";

        sendEmail(managerEmpId, managerEmail, subject, body, "GOAL_SUBMITTED");
    }

    // 3. Step 3: Notify CFL whenever Manager reverts goals back for revision
    public void notifyCflGoalReverted(Long cflEmpId, String cflEmail, String cflName, String stageName, String managerRemarks) {
        String subject = "StartSmart: Action Required - Goal Revision Requested for " + stageName;
        String body = "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;'>"
                + "<h2 style='color: #78161A;'>StartSmart Goal Revision Request</h2>"
                + "<p>Dear <b>" + (cflName != null ? cflName : "Employee") + "</b> (Employee ID: " + cflEmpId + "),</p>"
                + "<p>Your manager has reviewed your SMART goals for <b>" + stageName + "</b> and requested revisions.</p>"
                + "<div style='background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 12px; margin: 15px 0;'>"
                + "<strong>Manager Remarks / Guidance:</strong><br/>"
                + (managerRemarks != null && !managerRemarks.trim().isEmpty() ? managerRemarks : "Please review and update your goal weightages and target deliverables.")
                + "</div>"
                + "<p>Please log in to your StartSmart portal to update and re-submit your SMART goals.</p>"
                + "<br/><p>Best regards,<br/><b>StartSmart Performance Management</b></p>"
                + "</div>";

        sendEmail(cflEmpId, cflEmail, subject, body, "GOAL_REVISION_REQUESTED");
    }

    // 4. Step 4: Notify CFL when Reporting Manager approves their SMART goals
    public void notifyCflGoalApproved(Long cflEmpId, String cflEmail, String cflName, String stageName, String managerName) {
        String subject = "StartSmart: SMART Goals Approved for " + stageName;
        String body = "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;'>"
                + "<h2 style='color: #78161A;'>StartSmart Performance Management</h2>"
                + "<p>Dear <b>" + (cflName != null ? cflName : "Employee") + "</b> (Employee ID: " + cflEmpId + "),</p>"
                + "<p>Great news! Your reporting manager <b>" + (managerName != null ? managerName : "Manager") + "</b> has approved your SMART performance goals for <b>" + stageName + "</b>.</p>"
                + "<p>You can now view your approved goals and track your progress in the StartSmart portal.</p>"
                + "<br/><p>Best regards,<br/><b>StartSmart HR & Performance Team</b></p>"
                + "</div>";

        sendEmail(cflEmpId, cflEmail, subject, body, "GOAL_APPROVED");
    }
}
