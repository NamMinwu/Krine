package com.krine.decision.dto;

import com.krine.decision.Objection;
import com.krine.decision.Condition;
import com.krine.decision.Decision;
import com.krine.decision.DecisionOption;
import com.krine.decision.DecisionVersion;
import com.krine.decision.FlowMessage;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DecisionResponse(Long id, String title, String situation, String topicTag,
                               String rawDiary, String firstExpression,
                               String status, String flowStep,
                               List<String> criteria,
                               List<OptionResponse> options,
                               List<VersionResponse> versions,
                               List<ConditionResponse> conditions,
                               List<ObjectionResponse> objections,
                               List<MessageResponse> messages,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {

    public record OptionResponse(Long id, String label, List<String> gains,
                                 List<String> sacrifices, List<String> premises) {
        static OptionResponse from(DecisionOption o) {
            return new OptionResponse(o.getId(), o.getLabel(), List.copyOf(o.getGains()),
                    List.copyOf(o.getSacrifices()), List.copyOf(o.getPremises()));
        }
    }

    public record VersionResponse(Long id, int versionNo, String conclusion, String verdict,
                                  String reason, LocalDateTime createdAt) {
        static VersionResponse from(DecisionVersion v) {
            return new VersionResponse(v.getId(), v.getVersionNo(), v.getConclusion(),
                    v.getVerdict().name(), v.getReason(), v.getCreatedAt());
        }
    }

    public record ConditionResponse(Long id, String text, String type, LocalDate dueDate, String status) {
        static ConditionResponse from(Condition c) {
            return new ConditionResponse(c.getId(), c.getText(), c.getType().name(), c.getDueDate(), c.getStatus().name());
        }
    }

    public record ObjectionResponse(Long id, String perspective, String objection,
                                    String userAnswer, String reflectBack, String resolution) {
        static ObjectionResponse from(Objection ch) {
            return new ObjectionResponse(ch.getId(), ch.getPerspective(), ch.getObjection(),
                    ch.getUserAnswer(), ch.getReflectBack(), ch.getResolution().name());
        }
    }

    public record MessageResponse(Long id, String role, String content, String choicesJson) {
        static MessageResponse from(FlowMessage m) {
            return new MessageResponse(m.getId(), m.getRole().name(), m.getContent(), m.getChoicesJson());
        }
    }

    public static DecisionResponse from(Decision d) {
        return new DecisionResponse(
                d.getId(), d.getTitle(), d.getSituation(), d.getTopicTag(),
                d.getRawDiary(), d.getFirstExpression(),
                d.getStatus().name(), d.getFlowStep().name(),
                List.copyOf(d.getCriteria()),
                d.getOptions().stream().map(OptionResponse::from).toList(),
                d.getVersions().stream().map(VersionResponse::from).toList(),
                d.getConditions().stream().map(ConditionResponse::from).toList(),
                d.getObjections().stream().map(ObjectionResponse::from).toList(),
                d.getMessages().stream().map(MessageResponse::from).toList(),
                d.getCreatedAt(), d.getUpdatedAt());
    }
}
