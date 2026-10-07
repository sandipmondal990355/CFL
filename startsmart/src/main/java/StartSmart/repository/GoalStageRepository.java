package StartSmart.repository;

import StartSmart.entity.GoalStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoalStageRepository extends JpaRepository<GoalStage, Long> {
    Optional<GoalStage> findByStageCode(String stageCode);
}
