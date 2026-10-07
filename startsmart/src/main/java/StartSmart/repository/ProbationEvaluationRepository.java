package StartSmart.repository;

import StartSmart.entity.ProbationEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProbationEvaluationRepository extends JpaRepository<ProbationEvaluation, Long> {
    Optional<ProbationEvaluation> findByCflEmpId(Long cflEmpId);
}
