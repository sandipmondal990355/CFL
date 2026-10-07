package StartSmart.repository;

import StartSmart.entity.CflAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CflAssignmentRepository extends JpaRepository<CflAssignment, Long> {
    List<CflAssignment> findByStatus(String status);
    List<CflAssignment> findByCflEmpCode(Long cflEmpCode);
}
