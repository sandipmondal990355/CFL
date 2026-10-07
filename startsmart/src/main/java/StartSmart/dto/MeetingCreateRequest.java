package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingCreateRequest {
    private Long cflEmpId;
    private String cflName;
    private String cflEmpCode;
    private String meetingWithRole; // 'Mentor' | 'Manager' | 'HR' | 'CFL'
    private String selectedPerson;
    private String meetingType;
    private String meetingDate; // YYYY-MM-DD
    private String meetingTime; // HH:mm or 03:00 PM
    private String meetingMode; // 'Zoom' | 'Google Meet' | 'Teams Meeting' | 'In-Person'
    private String meetingLink;
    private String agenda;
}
