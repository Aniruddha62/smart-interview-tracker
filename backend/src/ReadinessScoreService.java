package com.tracker.service;

import com.tracker.dto.ReadinessScoreDTO;
import com.tracker.model.TopicProgress;
import com.tracker.model.TopicProgress.Domain;
import com.tracker.repository.TopicProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReadinessScoreService {

    private final TopicProgressRepository topicProgressRepository;

    /**
     * Core Algorithm: Calculates overall readiness score using weighted domain scores.
     *
     * Formula:
     *   domainScore     = avg(confidenceScores of all topics in domain)
     *   weightedScore   = domainScore × (domain_weightage / 100)
     *   overallScore    = Σ weightedScores across all domains
     *
     * Domain weights: DSA=40%, SystemDesign=35%, CoreJava=25%
     */
    public ReadinessScoreDTO calculateReadinessScore(Long userId) {
        Map<Domain, Double> domainScores = new HashMap<>();
        Map<Domain, List<TopicProgress>> weakAreas = new HashMap<>();
        Map<Domain, Integer> topicCounts = new HashMap<>();

        for (Domain domain : Domain.values()) {
            List<TopicProgress> topics = topicProgressRepository.findByUserIdAndDomain(userId, domain);

            if (topics.isEmpty()) {
                domainScores.put(domain, 0.0);
                topicCounts.put(domain, 0);
                continue;
            }

            double avgScore = topics.stream()
                    .mapToInt(t -> t.getConfidenceScore() != null ? t.getConfidenceScore() : 0)
                    .average()
                    .orElse(0.0);

            domainScores.put(domain, avgScore);
            topicCounts.put(domain, topics.size());

            // Identify weak topics (< 50 confidence score)
            List<TopicProgress> weak = topics.stream()
                    .filter(t -> t.getConfidenceScore() != null && t.getConfidenceScore() < 50)
                    .sorted(Comparator.comparingInt(TopicProgress::getConfidenceScore))
                    .toList();
            weakAreas.put(domain, weak);
        }

        // Calculate weighted overall score
        double overallScore = Arrays.stream(Domain.values())
                .mapToDouble(d -> (domainScores.getOrDefault(d, 0.0) * d.getWeightage()) / 100.0)
                .sum();

        return ReadinessScoreDTO.builder()
                .overallScore(Math.round(overallScore * 10.0) / 10.0)
                .domainScores(buildDomainScoreSummaries(domainScores, weakAreas, topicCounts))
                .readinessLevel(getReadinessLevel(overallScore))
                .totalTopicsTracked(topicCounts.values().stream().mapToInt(Integer::intValue).sum())
                .build();
    }

    private List<ReadinessScoreDTO.DomainSummary> buildDomainScoreSummaries(
            Map<Domain, Double> domainScores,
            Map<Domain, List<TopicProgress>> weakAreas,
            Map<Domain, Integer> topicCounts) {

        List<ReadinessScoreDTO.DomainSummary> summaries = new ArrayList<>();

        for (Domain domain : Domain.values()) {
            List<String> weakTopicNames = weakAreas.getOrDefault(domain, List.of())
                    .stream()
                    .map(TopicProgress::getTopicName)
                    .limit(5)
                    .toList();

            summaries.add(ReadinessScoreDTO.DomainSummary.builder()
                    .domain(domain.name())
                    .displayName(domain.getDisplayName())
                    .score(Math.round(domainScores.getOrDefault(domain, 0.0) * 10.0) / 10.0)
                    .weightage(domain.getWeightage())
                    .totalTopics(topicCounts.getOrDefault(domain, 0))
                    .weakTopics(weakTopicNames)
                    .build());
        }

        return summaries;
    }

    private String getReadinessLevel(double score) {
        if (score >= 85) return "INTERVIEW_READY";
        if (score >= 70) return "STRONG";
        if (score >= 50) return "MODERATE";
        if (score >= 30) return "DEVELOPING";
        return "BEGINNER";
    }
}
