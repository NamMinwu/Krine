package com.krine.decision.dto;

import java.util.List;

public record OptionInput(String label, List<String> gains, List<String> sacrifices, List<String> premises) {
}
