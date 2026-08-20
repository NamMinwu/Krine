package com.krine.flow.dto;

import com.krine.decision.dto.ConditionInput;
import com.krine.decision.dto.OptionInput;

import java.time.LocalDate;
import java.util.List;

public record StructureDraft(String title, String situation, String topicTag,
                             List<String> criteria, List<OptionInput> options,
                             List<ConditionInput> conditions,
                             LocalDate suggestedReviewDate) {
}
