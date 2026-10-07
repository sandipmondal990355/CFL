package StartSmart.service;

import StartSmart.dto.CflAssignmentResponse;
import StartSmart.dto.CflOnboardRequest;
import StartSmart.entity.Manager;
import StartSmart.entity.Mentor;

import java.util.List;
import java.util.Map;

public interface CflAssignmentService {
    CflAssignmentResponse onboardCfl(CflOnboardRequest request);
    Map<String, Object> getAllAssignments(String search, String businessUnit, String department, 
                                         String manager, String mentor, String status, int page, int size);
    List<Manager> getAllManagers();
    List<Mentor> getAllMentors();
    Map<String, Object> getCflsByManager(Long managerEmpCode, String search, String year, int page, int size);
    Map<String, Object> getCflsByMentor(Long mentorEmpCode, String search, String year, int page, int size);
    CflAssignmentResponse getCflByCflEmpCode(Long cflEmpCode);
    CflAssignmentResponse updateCflProfile(Long cflEmpCode, CflAssignmentResponse request);
}
