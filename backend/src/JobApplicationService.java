package com.tracker.service;

import com.tracker.dto.AppDTOs.*;
import com.tracker.exception.ApiException;
import com.tracker.model.JobApplication;
import com.tracker.model.User;
import com.tracker.repository.JobApplicationRepository;
import com.tracker.repository.InterviewRoundRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final UserRepository userRepository;

    public JobApplicationResponse create(Long userId, JobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        JobApplication app = JobApplication.builder()
                .companyName(request.getCompanyName())
                .jobRole(request.getJobRole())
                .jobLink(request.getJobLink())
                .location(request.getLocation())
                .salaryRange(request.getSalaryRange())
                .appliedDate(request.getAppliedDate())
                .status(request.getStatus() != null ? request.getStatus() : JobApplication.ApplicationStatus.APPLIED)
                .jobType(request.getJobType())
                .notes(request.getNotes())
                .user(user)
                .build();

        return toResponse(jobApplicationRepository.save(app));
    }

    public List<JobApplicationResponse> getAllByUser(Long userId) {
        return jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public JobApplicationResponse getById(Long id, Long userId) {
        JobApplication app = jobApplicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ApiException("Application not found", HttpStatus.NOT_FOUND));
        return toResponse(app);
    }

    public JobApplicationResponse update(Long id, Long userId, JobApplicationRequest request) {
        JobApplication app = jobApplicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ApiException("Application not found", HttpStatus.NOT_FOUND));

        app.setCompanyName(request.getCompanyName());
        app.setJobRole(request.getJobRole());
        app.setJobLink(request.getJobLink());
        app.setLocation(request.getLocation());
        app.setSalaryRange(request.getSalaryRange());
        app.setAppliedDate(request.getAppliedDate());
        app.setStatus(request.getStatus());
        app.setJobType(request.getJobType());
        app.setNotes(request.getNotes());

        return toResponse(jobApplicationRepository.save(app));
    }

    public void delete(Long id, Long userId) {
        JobApplication app = jobApplicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ApiException("Application not found", HttpStatus.NOT_FOUND));
        jobApplicationRepository.delete(app);
    }

    public List<JobApplicationResponse> search(Long userId, String keyword) {
        return jobApplicationRepository.searchByUserIdAndKeyword(userId, keyword)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private JobApplicationResponse toResponse(JobApplication app) {
        int rounds = app.getInterviewRounds() != null ? app.getInterviewRounds().size() : 0;
        return JobApplicationResponse.builder()
                .id(app.getId())
                .companyName(app.getCompanyName())
                .jobRole(app.getJobRole())
                .jobLink(app.getJobLink())
                .location(app.getLocation())
                .salaryRange(app.getSalaryRange())
                .appliedDate(app.getAppliedDate())
                .status(app.getStatus())
                .jobType(app.getJobType())
                .notes(app.getNotes())
                .createdAt(app.getCreatedAt())
                .totalRounds(rounds)
                .build();
    }
}
