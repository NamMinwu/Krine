package com.krine.decision.dto;

import java.time.LocalDate;

public record ConditionInput(String text, String type, LocalDate dueDate) {
}
