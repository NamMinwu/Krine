package com.krine.decision.dto;

import java.time.LocalDate;
import java.util.List;

public record StructureInput(String title, String situation, String topicTag,
                             List<String> criteria, List<OptionInput> options,
                             List<ConditionInput> conditions,
                             LocalDate checkInDate) {
}
