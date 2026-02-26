package com.tracker.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadinessScoreDTO {
    private double overallScore;
    private String readinessLevel;
    private int totalTopicsTracked;
    private List<DomainSummary> domainScores;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DomainSummary {
        private String domain;
        private String displayName;
        private double score;
        private double weightage;
        private int totalTopics;
        private List<String> weakTopics;
    }
}
