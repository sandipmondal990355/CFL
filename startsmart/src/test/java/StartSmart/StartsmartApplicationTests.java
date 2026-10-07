package StartSmart;

import StartSmart.dto.CflAssignmentResponse;
import StartSmart.dto.CflOnboardRequest;
import StartSmart.entity.Manager;
import StartSmart.entity.Mentor;
import StartSmart.repository.CflAssignmentRepository;
import StartSmart.repository.CflProfileRepository;
import StartSmart.repository.ManagerRepository;
import StartSmart.repository.MentorRepository;
import StartSmart.entity.CflProfile;
import StartSmart.entity.CflAssignment;
import StartSmart.service.CflAssignmentService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;

import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@Transactional
class StartsmartApplicationTests {

    @Autowired
    private CflAssignmentService cflAssignmentService;

    @Autowired
    private CflAssignmentRepository cflAssignmentRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private MentorRepository mentorRepository;

    @Autowired
    private CflProfileRepository cflProfileRepository;

    @Autowired
    private StartSmart.repository.DocumentRepository documentRepository;

    @Autowired
    private StartSmart.controller.DocumentController documentController;

    @Test
    void contextLoads() {
        Assertions.assertNotNull(cflAssignmentService);
    }

    @Test
    @Transactional
    void testOnboardNewCfl_AndManagerMentorCreated() {
        Long testCflCode = 9999999L;
        Long testManagerCode = 12345L;
        Long testMentorCode = 54321L;

        // Ensure they do not exist
        managerRepository.deleteById(testManagerCode);
        mentorRepository.deleteById(testMentorCode);
        cflAssignmentRepository.findAll().stream()
                .filter(a -> a.getCflEmpCode().equals(testCflCode))
                .forEach(a -> cflAssignmentRepository.delete(a));

        CflOnboardRequest request = CflOnboardRequest.builder()
                .cflEmpCode(testCflCode)
                .cflName("Test CFL")
                .cflEmail("test.cfl@startsmart.com")
                .role("Developer")
                .department("SSD")
                .businessUnit("SSD")
                .hrEmpCode(1001L)
                .managerEmpCode(testManagerCode)
                .managerName("Test Manager")
                .managerEmail("test.manager@cms.co.in")
                .mentorEmpCode(testMentorCode)
                .mentorName("Test Mentor")
                .mentorEmail("test.mentor@cms.co.in")
                .effectiveFrom(LocalDate.of(2026, 8, 23))
                .status("On Track")
                .goalProgress(60)
                .build();

        // Onboard
        CflAssignmentResponse response = cflAssignmentService.onboardCfl(request);

        // Verify assignment saved
        Assertions.assertNotNull(response);
        Assertions.assertEquals(testCflCode, response.getCflEmpCode());
        Assertions.assertEquals("On Track", response.getStatus());

        // Verify manager record was created in ss_manager
        Manager manager = managerRepository.findById(testManagerCode).orElse(null);
        Assertions.assertNotNull(manager);
        Assertions.assertEquals("Test Manager", manager.getName());

        // Verify mentor record was created in ss_mentor
        Mentor mentor = mentorRepository.findById(testMentorCode).orElse(null);
        Assertions.assertNotNull(mentor);
        Assertions.assertEquals("Test Mentor", mentor.getName());

        // Verify retrieved assignments contain this child
        java.util.Map<String, Object> result = cflAssignmentService.getAllAssignments("", "All", "All", "All", "All", "All", 0, 10);
        @SuppressWarnings("unchecked")
        List<CflAssignmentResponse> all = (List<CflAssignmentResponse>) result.get("content");
        boolean found = all.stream().anyMatch(a -> a.getCflEmpCode().equals(testCflCode));
        Assertions.assertTrue(found);
    }

    @Test
    @Transactional
    void testGetCflsByManager_FiltersAndPagination() {
        Long testCflCode = 9085412L;
        Long testManagerCode = 2001L;

        if (!managerRepository.existsById(testManagerCode)) {
            managerRepository.save(Manager.builder()
                    .empCode(testManagerCode)
                    .name("Manager 2001")
                    .email("manager2001@cms.co.in")
                    .build());
        }

        cflAssignmentRepository.findAll().stream()
                .filter(a -> a.getCflEmpCode().equals(testCflCode))
                .forEach(a -> cflAssignmentRepository.delete(a));

        cflAssignmentRepository.save(CflAssignment.builder()
                .cflEmpCode(testCflCode)
                .hrEmpCode(1001L)
                .managerEmpCode(testManagerCode)
                .mentorEmpCode(3001L)
                .effectiveFrom(LocalDate.of(2026, 8, 23))
                .status("On Track")
                .build());

        cflProfileRepository.save(CflProfile.builder()
                .cflEmpId(testCflCode)
                .name("Manpreet Kaur")
                .email("manpreet@startsmart.com")
                .role("Java Developer")
                .department("SSD")
                .businessUnit("SSD")
                .build());

        java.util.Map<String, Object> result = cflAssignmentService.getCflsByManager(testManagerCode, "Manpreet", "2026", 0, 5);
        Assertions.assertNotNull(result);
        @SuppressWarnings("unchecked")
        List<CflAssignmentResponse> content = (List<CflAssignmentResponse>) result.get("content");
        Assertions.assertFalse(content.isEmpty());
        Assertions.assertEquals(9085412L, content.get(0).getCflEmpCode());
    }

    @Test
    @Transactional
    void testUpdateCflProfile_AndSkillsUpdated() {
        Long testCflCode = 8888888L;
        
        // Remove existing profile/assignment if any
        cflProfileRepository.deleteById(testCflCode);
        cflAssignmentRepository.findAll().stream()
                .filter(a -> a.getCflEmpCode().equals(testCflCode))
                .forEach(a -> cflAssignmentRepository.delete(a));

        // Create initial assignment & profile
        cflAssignmentRepository.save(CflAssignment.builder()
                .cflEmpCode(testCflCode)
                .hrEmpCode(1001L)
                .managerEmpCode(2001L)
                .mentorEmpCode(3001L)
                .effectiveFrom(LocalDate.of(2026, 8, 25))
                .status("On Track")
                .build());

        cflProfileRepository.save(CflProfile.builder()
                .cflEmpId(testCflCode)
                .name("Old Name")
                .email("old@startsmart.com")
                .role("Software Engineer")
                .department("SSD")
                .businessUnit("SSD")
                .build());

        CflAssignmentResponse updateReq = CflAssignmentResponse.builder()
                .cflEmpCode(testCflCode)
                .cflName("New Name")
                .cflEmail("new@startsmart.com")
                .role("Senior Developer")
                .department("SSD")
                .businessUnit("SSD")
                .subDepartment("SSD-Sub")
                .location("Delhi")
                .gender("Male")
                .contactNumber("+91 99999 88888")
                .technicalSkills(List.of("Go", "Docker"))
                .nonTechnicalSkills(List.of("Leadership"))
                .status("Needs Attention")
                .build();

        CflAssignmentResponse updated = cflAssignmentService.updateCflProfile(testCflCode, updateReq);

        Assertions.assertNotNull(updated);
        Assertions.assertEquals("New Name", updated.getCflName());
        Assertions.assertEquals("new@startsmart.com", updated.getCflEmail());
        Assertions.assertEquals("Delhi", updated.getLocation());
        Assertions.assertEquals("Male", updated.getGender());
        Assertions.assertEquals("Needs Attention", updated.getStatus());
        Assertions.assertTrue(updated.getTechnicalSkills().contains("Go"));
        Assertions.assertTrue(updated.getNonTechnicalSkills().contains("Leadership"));
    }

    @Test
    @Transactional
    void testDocumentUploadAndDownload() throws Exception {
        Long testCflCode = 9085499L;
        
        // Mock a multipart file upload
        org.springframework.mock.web.MockMultipartFile mockFile = new org.springframework.mock.web.MockMultipartFile(
                "file",
                "test_junit_upload.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Hello Junit Word Upload Content".getBytes()
        );

        // Act - upload document
        ResponseEntity<?> uploadResponse = documentController.uploadDocument(mockFile, testCflCode, "Resume");
        Assertions.assertEquals(HttpStatus.CREATED, uploadResponse.getStatusCode());
        Assertions.assertNotNull(uploadResponse.getBody());
        
        StartSmart.entity.Document savedDoc = (StartSmart.entity.Document) uploadResponse.getBody();
        Assertions.assertNotNull(savedDoc.getId());
        Assertions.assertEquals("test_junit_upload.docx", savedDoc.getFileName());
        Assertions.assertEquals("Resume", savedDoc.getDocumentType());
        Assertions.assertTrue(new java.io.File(savedDoc.getFilePath()).exists());

        // Act - retrieve all documents for CFL
        ResponseEntity<List<StartSmart.entity.Document>> listResponse = documentController.getDocumentsByCfl(testCflCode);
        Assertions.assertEquals(HttpStatus.OK, listResponse.getStatusCode());
        Assertions.assertNotNull(listResponse.getBody());
        boolean foundObj = listResponse.getBody().stream().anyMatch(d -> d.getId().equals(savedDoc.getId()));
        Assertions.assertTrue(foundObj);

        // Act - download file
        ResponseEntity<org.springframework.core.io.Resource> downloadResponse = documentController.downloadDocument(savedDoc.getId());
        Assertions.assertEquals(HttpStatus.OK, downloadResponse.getStatusCode());
        Assertions.assertNotNull(downloadResponse.getBody());
        
        // Assert downloader resource properties
        Assertions.assertEquals(
                "attachment; filename=\"test_junit_upload.docx\"", 
                downloadResponse.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)
        );
        
        // Cleanup physical file saved during test
        java.io.File physicalFile = new java.io.File(savedDoc.getFilePath());
        if (physicalFile.exists()) {
            physicalFile.delete();
        }
    }

    @Test
    @Transactional
    void testDocumentUploadAndView() throws Exception {
        Long testCflCode = 9085499L;
        
        // Mock a multipart file upload
        org.springframework.mock.web.MockMultipartFile mockFile = new org.springframework.mock.web.MockMultipartFile(
                "file",
                "test_junit_view.pdf",
                "application/pdf",
                "Hello Junit PDF Document Content".getBytes()
        );

        // Act - upload document
        ResponseEntity<?> uploadResponse = documentController.uploadDocument(mockFile, testCflCode, "Resume");
        Assertions.assertEquals(HttpStatus.CREATED, uploadResponse.getStatusCode());
        Assertions.assertNotNull(uploadResponse.getBody());
        
        StartSmart.entity.Document savedDoc = (StartSmart.entity.Document) uploadResponse.getBody();
        Assertions.assertNotNull(savedDoc.getId());
        Assertions.assertEquals("test_junit_view.pdf", savedDoc.getFileName());

        // Act - view document inline
        ResponseEntity<org.springframework.core.io.Resource> viewResponse = documentController.viewDocument(savedDoc.getId());
        Assertions.assertEquals(HttpStatus.OK, viewResponse.getStatusCode());
        Assertions.assertNotNull(viewResponse.getBody());
        
        // Assert view resource properties - should be inline disposition
        Assertions.assertEquals(
                "inline; filename=\"test_junit_view.pdf\"", 
                viewResponse.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)
        );
        Assertions.assertEquals(
                "application/pdf",
                viewResponse.getHeaders().getContentType().toString()
        );
        
        // Cleanup physical file saved during test
        java.io.File physicalFile = new java.io.File(savedDoc.getFilePath());
        if (physicalFile.exists()) {
            physicalFile.delete();
        }
    }
}
