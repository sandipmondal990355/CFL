package StartSmart.repository;

import StartSmart.entity.CflSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CflSkillRepository extends JpaRepository<CflSkill, Long> {
    List<CflSkill> findByCflEmpId(Long cflEmpId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from CflSkill c where c.cflEmpId = ?1")
    void deleteByCflEmpId(Long cflEmpId);
}
