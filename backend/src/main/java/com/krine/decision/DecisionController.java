package com.krine.decision;

import com.krine.common.ApiResponse;
import com.krine.decision.dto.DecisionResponse;
import com.krine.decision.dto.DecisionSummaryResponse;
import com.krine.decision.dto.ReviewInput;
import com.krine.decision.dto.ReviewQueueItem;
import com.krine.decision.dto.StructureInput;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DecisionController {
    private final DecisionService service;
    private final ReviewQueueService queueService;

    @PostMapping("/decisions")
    public ApiResponse<DecisionResponse> create(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(service.createDraftResponse(body.get("rawDiary")));
    }

    @GetMapping("/decisions")
    public ApiResponse<List<DecisionSummaryResponse>> list() {
        return ApiResponse.ok(service.listSummaries());
    }

    @GetMapping("/decisions/{id}")
    public ApiResponse<DecisionResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(service.getResponse(id));
    }

    @PutMapping("/decisions/{id}/structure")
    public ApiResponse<DecisionResponse> structure(@PathVariable Long id, @RequestBody StructureInput input) {
        return ApiResponse.ok(service.updateStructureResponse(id, input));
    }

    @PostMapping("/decisions/{id}/confirm")
    public ApiResponse<DecisionResponse> confirm(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(service.confirmResponse(id, body.get("conclusion"), body.get("firstExpression")));
    }

    @PostMapping("/decisions/{id}/review")
    public ApiResponse<DecisionResponse> review(@PathVariable Long id, @RequestBody ReviewInput input) {
        return ApiResponse.ok(service.reviewResponse(id, input));
    }

    @GetMapping("/review-queue")
    public ApiResponse<List<ReviewQueueItem>> queue() {
        return ApiResponse.ok(queueService.getQueue(LocalDate.now()));
    }
}
