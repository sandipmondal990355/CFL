package StartSmart.repository;

import StartSmart.entity.CflProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CflProfileRepository extends JpaRepository<CflProfile, Long> {
}
