package StartSmart.controller;

import StartSmart.entity.Memory;
import StartSmart.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/memories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class MemoryController {

    private final MemoryRepository memoryRepository;
    private static final String STORAGE_DIR = "cfl memories";

    @PostConstruct
    public void init() {
        File dir = new File(STORAGE_DIR);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            log.info("Created 'cfl memories' directory: {}", created);
        }
        cleanupMockUnsplashMemories();
    }

    private void cleanupMockUnsplashMemories() {
        try {
            List<Memory> mockMemories = memoryRepository.findAll().stream()
                    .filter(m -> m.getFilePath() != null && m.getFilePath().startsWith("https://images.unsplash.com"))
                    .collect(Collectors.toList());
            if (!mockMemories.isEmpty()) {
                log.info("Cleaning up {} auto-seeded mock unsplash memory records from DB...", mockMemories.size());
                memoryRepository.deleteAll(mockMemories);
            }
        } catch (Exception e) {
            log.error("Failed to clean up mock memory records", e);
        }
    }

    @GetMapping
    public ResponseEntity<?> getMemories(@RequestParam(value = "year", required = false) Integer year) {
        log.info("REST request to fetch memories for year: {}", year);
        List<Memory> memories;
        if (year != null) {
            memories = memoryRepository.findByMemoryYearOrderByUploadedAtDesc(year);
        } else {
            memories = memoryRepository.findAllByOrderByUploadedAtDesc();
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        List<Map<String, Object>> responseList = memories.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("cflEmpId", m.getCflEmpId());
            map.put("memoryYear", m.getMemoryYear());
            map.put("title", m.getTitle());
            map.put("description", m.getDescription());
            map.put("mediaType", m.getMediaType());
            map.put("formattedDate", m.getUploadedAt() != null ? m.getUploadedAt().format(fmt) : "2026");
            
            // If filePath is HTTP URL, use it directly; otherwise construct view endpoint URL
            if (m.getFilePath().startsWith("http")) {
                map.put("imageUrl", m.getFilePath());
            } else {
                map.put("imageUrl", "http://localhost:9085/api/memories/view/" + m.getId());
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMemories(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("occasionName") String occasionName,
            @RequestParam(value = "year", defaultValue = "2026") Integer year,
            @RequestParam(value = "cflEmpId", required = false) Long cflEmpId) {
        log.info("REST request to upload {} memory photos for occasion: {}, year: {}", files.length, occasionName, year);

        File dir = new File(STORAGE_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        List<Memory> savedMemories = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                String originalName = file.getOriginalFilename();
                String cleanName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_") : "photo.jpg";
                String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
                Path targetPath = Paths.get(STORAGE_DIR).resolve(fileName);

                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                log.info("Saved memory file to: {}", targetPath.toAbsolutePath());

                String contentType = file.getContentType();
                boolean isVideo = (contentType != null && contentType.startsWith("video")) ||
                        (originalName != null && (originalName.endsWith(".mp4") || originalName.endsWith(".mov") || originalName.endsWith(".webm") || originalName.endsWith(".avi") || originalName.endsWith(".mkv")));

                Memory mem = Memory.builder()
                        .cflEmpId(cflEmpId != null ? cflEmpId : 0L)
                        .memoryYear(year)
                        .title(occasionName)
                        .description(occasionName)
                        .mediaType(isVideo ? "VIDEO" : "IMAGE")
                        .filePath(targetPath.toString())
                        .uploadedBy(1L)
                        .uploadedAt(LocalDateTime.now())
                        .build();

                savedMemories.add(memoryRepository.save(mem));
            } catch (IOException e) {
                log.error("Failed to store memory file", e);
                return ResponseEntity.internalServerError().body("Failed to store file: " + file.getOriginalFilename());
            }
        }

        return ResponseEntity.ok(savedMemories);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewMemoryImage(@PathVariable Long id) {
        log.info("REST request to view memory image: {}", id);
        Optional<Memory> memOpt = memoryRepository.findById(id);
        if (memOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Memory memory = memOpt.get();
        try {
            Path filePath = Paths.get(memory.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.IMAGE_JPEG_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error serving memory image ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
