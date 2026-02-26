package com.tracker.dto;

import com.tracker.model.JobApplication.ApplicationStatus;
import com.tracker.model.JobApplication.JobType;
import com.tracker.model.InterviewRound.RoundType;
import com.tracker.model.InterviewRound.RoundOutcome;
import com.tracker.model.TopicProgress.Domain;
import com.tracker.model.TopicProgress.Status;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

// ============ Auth DTOs ============
public class AppDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank private String fullName;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data @Builder
    @AllArgsConstructor @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String email;
        private String fullName;
        private Long userId;
    }

    // ============ Job Application DTOs ============
    @Data
    public static class JobApplicationRequest {
        @NotBlank private String companyName;
        @NotBlank private String jobRole;
        private String jobLink;
        private String location;
        private String salaryRange;
        private LocalDate appliedDate;
        private ApplicationStatus status;
        private JobType jobType;
        private String notes;
    }

    @Data @Builder
    @AllArgsConstructor @NoArgsConstructor
    public static class JobApplicationResponse {
        private Long id;
        private String companyName;
        private String jobRole;
        private String jobLink;
        private String location;
        private String salaryRange;
        private LocalDate appliedDate;
        private ApplicationStatus status;
        private JobType jobType;
        private String notes;
        private LocalDateTime createdAt;
        private int totalRounds;
    }

    // ============ Interview Round DTOs ============
    @Data
    public static class InterviewRoundRequest {
        @NotNull private Long jobApplicationId;
        @NotNull private RoundType roundType;
        private Integer roundNumber;
        private LocalDateTime scheduledAt;
        private String interviewerName;
        private String platform;
        private RoundOutcome outcome;
        private String feedback;
        private String questionsAsked;
        private Integer difficultyRating;
    }

    // ============ Topic Progress DTOs ============
    @Data
    public static class TopicProgressRequest {
        @NotBlank private String topicName;
        @NotNull private Domain domain;
        @Min(0) @Max(100) private Integer confidenceScore;
        private Status status;
        private Integer practiceProblems;
        private Integer solvedProblems;
        private String notes;
        private String resourceUrl;
    }

    // ============ Dashboard DTO ============
    @Data @Builder
    @AllArgsConstructor @NoArgsConstructor
    public static class DashboardStats {
        private long totalApplications;
        private long activeApplications;
        private long interviewsScheduled;
        private long offersReceived;
        private ReadinessScoreDTO readinessScore;
        private java.util.Map<String, Long> applicationsByStatus;
        private java.util.List<InterviewRound> upcomingInterviews;
    }
}
