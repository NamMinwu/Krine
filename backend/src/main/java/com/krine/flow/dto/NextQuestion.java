package com.krine.flow.dto;

import java.util.List;

public record NextQuestion(String question, List<String> choices, boolean done, int progress, int total) {
}
