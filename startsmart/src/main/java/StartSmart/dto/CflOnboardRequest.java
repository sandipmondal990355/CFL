package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CflOnboardRequest {
    private Long cflEmpCode;
    private String cflName;
    private String cflEmail;
    private String role;
    private String department;
    private String businessUnit;
    private Long hrEmpCode;
    private Long managerEmpCode;
    private String managerName;
    private String managerEmail;
    private Long mentorEmpCode;
    private String mentorName;
    private String mentorEmail;
    private LocalDate effectiveFrom;
    private String status;
    private Integer goalProgress;

    // Detailed Personal & Organizational Details
    private String firstName;
    private String middleName;
    private String lastName;
    private String designation;
    private String subDepartment;
    private LocalDate dateOfJoining;
    private String project;
    private String projectClassification;
    private String buHead;
    private String location;
    private String gender;
    private String vertical;
    private String contactNumber;
    private String subArea;
    private String category;

    // Scholastics Info
    private String sscPercentage;
    private String hscPercentage;
    private String ugPercentage;
    private String pgPercentage;
    private String instituteName;
    private String instituteBranch;

    // Skills
    private java.util.List<String> primaryTechSkills;
    private java.util.List<String> primaryNonTechSkills;

    // Bio
    private String bio;
}
