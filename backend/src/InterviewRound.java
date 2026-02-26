package com.tracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_rounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundType roundType;

    private Integer roundNumber;
    private LocalDateTime scheduledAt;
    private String interviewerName;
    private String platform; // Zoom, Google Meet, etc.

    @Enumerated(EnumType.STRING)
    private RoundOutcome outcome;

    @Column(length = 2000)
    private String feedback;

    @Column(length = 2000)
    private String questionsAsked;

    private Integer difficultyRating; // 1-5

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum RoundType {
        ONLINE_ASSESSMENT, DSA_CODING, SYSTEM_DESIGN, TECHNICAL, MANAGERIAL, HR, CASE_STUDY
    }

    public enum RoundOutcome {
        PENDING, CLEARED, REJECTED, WAITLISTED, RESCHEDULED
    }
}
