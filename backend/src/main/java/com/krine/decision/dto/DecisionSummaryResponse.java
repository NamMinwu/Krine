package com.krine.decision.dto;

import com.krine.decision.Decision;
import com.krine.decision.DecisionVersion;

import java.time.LocalDateTime;

public record DecisionSummaryResponse(Long id, String title, String topicTag,
                                      String status, String flowStep,
                                      String lastVerdict, String lastConclusion,
                                      LocalDateTime updatedAt) {
    public static DecisionSummaryResponse from(Decision d) {
        DecisionVersion last = d.getVersions().isEmpty() ? null
                : d.getVersions().get(d.getVersions().size() - 1);
        return new DecisionSummaryResponse(
                d.getId(), d.getTitle(), d.getTopicTag(),
                d.getStatus().name(), d.getFlowStep().name(),
                last == null ? null : last.getVerdict().name(),
                last == null ? null : last.getConclusion(),
                d.getUpdatedAt());
    }
}
