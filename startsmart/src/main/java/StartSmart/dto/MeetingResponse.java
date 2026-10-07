package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingResponse {
    private Long id;
    private String date; // YYYY-MM-DD
    private Integer day;
    private String month; // JAN, FEB, MAR, etc.
    private Integer year;
    private String title;
    private String time; // e.g. "03:00 PM"
    private String mode; // 'Zoom', 'Google Meet', etc.
    private String createdByType; // 'Mentor' | 'You' | 'Manager' | 'HR'
    private String link;
    private String status; // 'Scheduled', 'Completed', 'Cancelled'
    private String withPerson;
    private String cflName;
    private String cflEmpCode;
    private String agenda;
    private String meetingType;
}
