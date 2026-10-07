package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CflAssignmentResponse {
    private Long id;
    private Long cflEmpCode;
    private String cflName;
    private String cflEmail;
    private String role;
    private String department;
    private String businessUnit;
    private Long hrEmpCode;
    private Long managerEmpCode;
    private String managerName;
    private Long mentorEmpCode;
    private String mentorName;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String status;
    private Integer goalProgress;
    private String subDepartment;
    private String location;
    private String gender;
    private String contactNumber;

    // Detailed Personal & Organizational Details
    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dateOfJoining;
    private String managerEmail;
    private String mentorEmail;
    private String mentorRole;
    private String project;
    private String projectClassification;
    private String buHead;
    private String vertical;
    private String subArea;
    private String category;

    // Scholastics Info
    private String sscPercentage;
    private String hscPercentage;
    private String ugPercentage;
    private String pgPercentage;
    private String instituteName;
    private String instituteBranch;

    // Bio
    private String bio;

    private java.util.List<String> technicalSkills;
    private java.util.List<String> nonTechnicalSkills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
