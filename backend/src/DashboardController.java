package com.tracker.controller;

import com.tracker.dto.AppDTOs.DashboardStats;
import com.tracker.dto.ReadinessScoreDTO;
import com.tracker.model.JobApplication.ApplicationStatus;
import com.tracker.repository.JobApplicationRepository;
import com.tracker.repository.InterviewRoundRepository;
import com.tracker.service.ReadinessScoreService;
import com.tracker.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final ReadinessScoreService readinessScoreService;

    @GetMapping
    public ResponseEntity<DashboardStats> getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();

        // Build status map
        Map<String, Long> statusMap = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusMap.put(status.name(), jobApplicationRepository.countByUserIdAndStatus(userId, status));
        }

        ReadinessScoreDTO readinessScore = readinessScoreService.calculateReadinessScore(userId);

        DashboardStats stats = DashboardStats.builder()
                .totalApplications(jobApplicationRepository.countByUserId(userId))
                .activeApplications(jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW))
                .offersReceived(jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER))
                .interviewsScheduled(interviewRoundRepository.findUpcomingByUserId(userId).size())
                .readinessScore(readinessScore)
                .applicationsByStatus(statusMap)
                .upcomingInterviews(interviewRoundRepository.findUpcomingByUserId(userId))
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/readiness")
    public ResponseEntity<ReadinessScoreDTO> getReadinessScore() {
        return ResponseEntity.ok(readinessScoreService.calculateReadinessScore(SecurityUtils.getCurrentUserId()));
    }
}
