package com.tracker.repository;

import com.tracker.model.InterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InterviewRoundRepository extends JpaRepository<InterviewRound, Long> {

    List<InterviewRound> findByJobApplicationId(Long jobApplicationId);

    @Query("SELECT r FROM InterviewRound r WHERE r.jobApplication.user.id = :userId ORDER BY r.scheduledAt DESC")
    List<InterviewRound> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT r.roundType, COUNT(r), SUM(CASE WHEN r.outcome = 'CLEARED' THEN 1 ELSE 0 END) " +
           "FROM InterviewRound r WHERE r.jobApplication.user.id = :userId GROUP BY r.roundType")
    List<Object[]> roundStatsByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM InterviewRound r WHERE r.jobApplication.user.id = :userId AND r.scheduledAt >= CURRENT_TIMESTAMP ORDER BY r.scheduledAt ASC")
    List<InterviewRound> findUpcomingByUserId(@Param("userId") Long userId);
}
