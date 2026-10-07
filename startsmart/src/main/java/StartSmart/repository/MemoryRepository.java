package StartSmart.repository;

import StartSmart.entity.Memory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoryRepository extends JpaRepository<Memory, Long> {
    List<Memory> findByMemoryYearOrderByUploadedAtDesc(Integer memoryYear);
    List<Memory> findAllByOrderByUploadedAtDesc();
}
