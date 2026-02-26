package com.tracker.repository;

import com.tracker.model.JobApplication;
import com.tracker.model.JobApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<JobApplication> findByUserIdAndStatus(Long userId, ApplicationStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j WHERE j.user.id = :userId GROUP BY j.status")
    List<Object[]> countByStatusForUser(@Param("userId") Long userId);

    @Query("SELECT j.companyName, COUNT(j) FROM JobApplication j WHERE j.user.id = :userId GROUP BY j.companyName ORDER BY COUNT(j) DESC")
    List<Object[]> topCompaniesByApplications(@Param("userId") Long userId);

    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId AND " +
           "(LOWER(j.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.jobRole) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<JobApplication> searchByUserIdAndKeyword(@Param("userId") Long userId, @Param("search") String search);
}
