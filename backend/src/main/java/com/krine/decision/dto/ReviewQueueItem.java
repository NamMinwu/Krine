package com.krine.decision.dto;

import java.time.LocalDate;

public record ReviewQueueItem(Long decisionId, String decisionTitle,
                              String kind, // DUE_DATE | EVENT_CHECKIN | DEFERRED_OBJECTION
                              Long refId, String text, LocalDate dueDate) {
}
