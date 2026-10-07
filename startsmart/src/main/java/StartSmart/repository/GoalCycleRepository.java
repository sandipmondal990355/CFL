package StartSmart.repository;

import StartSmart.entity.GoalCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalCycleRepository extends JpaRepository<GoalCycle, Long> {
    Optional<GoalCycle> findByYearAndStatus(Integer year, String status);
    List<GoalCycle> findByYear(Integer year);
}
