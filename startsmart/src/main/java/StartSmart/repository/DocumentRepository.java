package StartSmart.repository;

import StartSmart.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCflEmpId(Long cflEmpId);
    List<Document> findByCflEmpIdAndDocumentTypeOrderByIdDesc(Long cflEmpId, String documentType);

}
