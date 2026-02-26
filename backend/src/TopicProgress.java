package com.tracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "topic_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topicName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Domain domain;

    private Integer confidenceScore; // 0-100

    @Enumerated(EnumType.STRING)
    private Status status;

    private Integer practiceProblems;
    private Integer solvedProblems;

    @Column(length = 1000)
    private String notes;

    private String resourceUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime lastReviewed;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum Domain {
        DSA("Data Structures & Algorithms", 40.0),
        SYSTEM_DESIGN("System Design", 35.0),
        CORE_JAVA("Core Java & CS Fundamentals", 25.0);

        private final String displayName;
        private final double weightage;

        Domain(String displayName, double weightage) {
            this.displayName = displayName;
            this.weightage = weightage;
        }

        public String getDisplayName() { return displayName; }
        public double getWeightage() { return weightage; }
    }

    public enum Status {
        NOT_STARTED, IN_PROGRESS, NEEDS_REVISION, COMPLETED
    }
}
