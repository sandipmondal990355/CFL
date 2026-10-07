package StartSmart.controller;

import StartSmart.entity.Document;
import StartSmart.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DocumentController {

    private final DocumentRepository documentRepository;

    @Value("${file.upload-dir:uploads}")
    private String configuredUploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("cflEmpId") Long cflEmpId,
            @RequestParam("documentType") String documentType) {
        log.info("REST request to upload document: {} of type: {} for CFL: {}", 
                file.getOriginalFilename(), documentType, cflEmpId);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded file is empty");
        }

        try {
            // 1. Resolve configured upload directory path
            String uploadsPath = (configuredUploadDir.startsWith("/") || configuredUploadDir.contains(":"))
                    ? configuredUploadDir
                    : System.getProperty("user.dir") + File.separator + configuredUploadDir;
            File uploadDirectory = new File(uploadsPath);
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            // 2. Resolve safe target filename (handling potential collisions)
            String originalFilename = file.getOriginalFilename();
            String cleanFilename = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "document_" + System.currentTimeMillis();
            File targetFile = new File(uploadDirectory, System.currentTimeMillis() + "_" + cleanFilename);
            
            // 3. Save physical file to disk
            file.transferTo(targetFile);
            log.info("Physical file saved at: {}", targetFile.getAbsolutePath());

            // 4. Save metadata record into database
            Document document = Document.builder()
                    .cflEmpId(cflEmpId)
                    .documentType(documentType)
                    .fileName(originalFilename)
                    .filePath(targetFile.getAbsolutePath())
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedBy(cflEmpId) // Assuming uploaded by CFL themselves for now
                    .build();

            Document savedDocument = documentRepository.save(document);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedDocument);

        } catch (IOException e) {
            log.error("Failed to save uploaded file physically to folder", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to store file physically: " + e.getMessage());
        }
    }

    @GetMapping("/cfl/{cflEmpId}")
    public ResponseEntity<List<Document>> getDocumentsByCfl(@PathVariable Long cflEmpId) {
        log.info("REST request to retrieve all documents for CFL: {}", cflEmpId);
        List<Document> documents = documentRepository.findByCflEmpId(cflEmpId);
        
        // Clean up any previously auto-seeded sample documents from database
        List<Document> autoSeeded = documents.stream()
                .filter(d -> d.getFilePath() != null && (
                        d.getFilePath().contains("AWS_Solutions_Architect.pdf") ||
                        d.getFilePath().contains("DevOps_Engineer_Resume.docx") ||
                        d.getFilePath().contains("Kubernetes_Logbook.xlsx")
                ))
                .toList();

        if (!autoSeeded.isEmpty()) {
            log.info("Purging {} auto-seeded sample documents for CFL: {}", autoSeeded.size(), cflEmpId);
            documentRepository.deleteAll(autoSeeded);
            documents = documentRepository.findByCflEmpId(cflEmpId);
        }

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/cfl/{cflEmpId}/type/{documentType}")
    public ResponseEntity<List<Document>> getDocumentsByCflAndType(
            @PathVariable Long cflEmpId,
            @PathVariable String documentType) {
        log.info("REST request to retrieve documents for CFL: {} of type: {}", cflEmpId, documentType);
        List<Document> documents = documentRepository.findByCflEmpIdAndDocumentTypeOrderByIdDesc(cflEmpId, documentType);
        return ResponseEntity.ok(documents);
    }

    private MediaType resolveMediaType(Document doc, File file) {
        if (doc.getMimeType() != null && !doc.getMimeType().equals("application/octet-stream")) {
            try {
                return MediaType.parseMediaType(doc.getMimeType());
            } catch (Exception e) {
                log.warn("Failed to parse stored mimeType: {}", doc.getMimeType());
            }
        }
        try {
            if (file != null && file.exists()) {
                String probedType = Files.probeContentType(file.toPath());
                if (probedType != null) {
                    return MediaType.parseMediaType(probedType);
                }
            }
        } catch (Exception ignored) {}

        String fname = doc.getFileName() != null ? doc.getFileName().toLowerCase() : "";
        if (fname.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (fname.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (fname.endsWith(".jpg") || fname.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (fname.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (fname.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        if (fname.endsWith(".doc")) return MediaType.parseMediaType("application/msword");
        if (fname.endsWith(".docx")) return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        if (fname.endsWith(".txt")) return MediaType.TEXT_PLAIN;

        return MediaType.APPLICATION_OCTET_STREAM;
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        log.info("REST request to download document ID: {}", id);
        
        return documentRepository.findById(id)
                .map(doc -> {
                    try {
                        byte[] fileBytes;
                        File file = new File(doc.getFilePath());
                        if (file.exists()) {
                            fileBytes = Files.readAllBytes(Paths.get(file.getAbsolutePath()));
                        } else {
                            // Provide synthetic document stream content if physical file on disk is missing
                            String content = "StartSmart Document Content for " + doc.getFileName() + "\nDocument Type: " + doc.getDocumentType() + "\nCFL ID: " + doc.getCflEmpId();
                            fileBytes = content.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        }
                        
                        ByteArrayResource resource = new ByteArrayResource(fileBytes);
                        MediaType mediaType = resolveMediaType(doc, file);

                        return ResponseEntity.ok()
                                .contentType(mediaType)
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                                .contentLength(fileBytes.length)
                                .body((Resource) resource);

                    } catch (IOException e) {
                        log.error("Failed to read physical file content for download", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body((Resource) null);
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long id) {
        log.info("REST request to view document ID: {}", id);
        
        return documentRepository.findById(id)
                .map(doc -> {
                    try {
                        byte[] fileBytes;
                        File file = new File(doc.getFilePath());
                        if (file.exists()) {
                            fileBytes = Files.readAllBytes(Paths.get(file.getAbsolutePath()));
                        } else {
                            // Provide synthetic document stream content if physical file on disk is missing
                            String content = "StartSmart Document Content for " + doc.getFileName() + "\nDocument Type: " + doc.getDocumentType() + "\nCFL ID: " + doc.getCflEmpId();
                            fileBytes = content.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        }
                        
                        ByteArrayResource resource = new ByteArrayResource(fileBytes);
                        MediaType mediaType = resolveMediaType(doc, file);

                        return ResponseEntity.ok()
                                .contentType(mediaType)
                                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                                .contentLength(fileBytes.length)
                                .body((Resource) resource);

                    } catch (IOException e) {
                        log.error("Failed to read physical file content for view", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body((Resource) null);
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
}

