package com.krine.decision.dto;

public record ReviewInput(String verdict, String reason, String newConclusion, Long triggeredConditionId) {
}
