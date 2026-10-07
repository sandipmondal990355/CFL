package StartSmart.repository;

import StartSmart.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByCflEmpId(Long cflEmpId);
    List<Goal> findByCflEmpIdAndStageId(Long cflEmpId, Long stageId);
    List<Goal> findByWorkflowId(Long workflowId);
}
