package StartSmart.repository;

import StartSmart.entity.GoalWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalWorkflowRepository extends JpaRepository<GoalWorkflow, Long> {
    List<GoalWorkflow> findByCflEmpId(Long cflEmpId);
    List<GoalWorkflow> findByCycleIdAndStageIdAndCflEmpId(Long cycleId, Long stageId, Long cflEmpId);
    List<GoalWorkflow> findByStageId(Long stageId);
}
