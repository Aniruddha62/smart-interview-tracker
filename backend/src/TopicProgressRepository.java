package com.tracker.repository;

import com.tracker.model.TopicProgress;
import com.tracker.model.TopicProgress.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> {

    List<TopicProgress> findByUserId(Long userId);

    List<TopicProgress> findByUserIdAndDomain(Long userId, Domain domain);

    @Query("SELECT t.domain, AVG(t.confidenceScore) FROM TopicProgress t WHERE t.user.id = :userId GROUP BY t.domain")
    List<Object[]> avgScoreByDomainForUser(@Param("userId") Long userId);

    @Query("SELECT t FROM TopicProgress t WHERE t.user.id = :userId AND t.confidenceScore < 50 ORDER BY t.confidenceScore ASC")
    List<TopicProgress> findWeakTopicsByUserId(@Param("userId") Long userId);

    long countByUserIdAndDomain(Long userId, Domain domain);
}
