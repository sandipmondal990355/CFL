package StartSmart.repository;

import StartSmart.entity.CareerMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerMovementRepository extends JpaRepository<CareerMovement, Long> {
    Optional<CareerMovement> findByCflEmpId(Long cflEmpId);
}
