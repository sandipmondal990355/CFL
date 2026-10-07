package StartSmart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ss_cfl_profile", schema = "startsmart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CflProfile {

    @Id
    @Column(name = "cfl_emp_id")
    private Long cflEmpId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "role")
    private String role;

    @Column(name = "department")
    private String department;

    @Column(name = "business_unit")
    private String businessUnit;

    @Column(name = "goal_progress")
    @Builder.Default
    private Integer goalProgress = 0;

    @Column(name = "sub_department")
    private String subDepartment;

    @Column(name = "location")
    private String location;

    @Column(name = "gender")
    private String gender;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "date_of_joining")
    private java.time.LocalDate dateOfJoining;

    @Column(name = "project")
    private String project;

    @Column(name = "project_classification")
    private String projectClassification;

    @Column(name = "bu_head")
    private String buHead;

    @Column(name = "vertical")
    private String vertical;

    @Column(name = "sub_area")
    private String subArea;

    @Column(name = "category")
    private String category;

    @Column(name = "ssc_percentage")
    private String sscPercentage;

    @Column(name = "hsc_percentage")
    private String hscPercentage;

    @Column(name = "ug_percentage")
    private String ugPercentage;

    @Column(name = "pg_percentage")
    private String pgPercentage;

    @Column(name = "institute_name")
    private String instituteName;

    @Column(name = "institute_branch")
    private String instituteBranch;

    @Column(name = "bio", length = 1000)
    private String bio;
}
