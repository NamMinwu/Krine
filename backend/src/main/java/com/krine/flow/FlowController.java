package com.krine.flow;

import com.krine.common.ApiResponse;
import com.krine.decision.dto.DecisionResponse;
import com.krine.flow.dto.AnswerResult;
import com.krine.flow.dto.ObjectionResult;
import com.krine.flow.dto.DiscoverResult;
import com.krine.flow.dto.NextQuestion;
import com.krine.flow.dto.StructureDraft;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FlowController {
    private final FlowService flowService;

    @PostMapping("/decisions/{id}/discover")
    public ApiResponse<DiscoverResult> discover(@PathVariable Long id) {
        return ApiResponse.ok(flowService.discover(id));
    }

    @PostMapping("/decisions/{id}/answer")
    public ApiResponse<NextQuestion> answer(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(flowService.answer(id, body.get("answer")));
    }

    @PostMapping("/decisions/{id}/structure/draft")
    public ApiResponse<StructureDraft> structureDraft(@PathVariable Long id) {
        return ApiResponse.ok(flowService.structureDraft(id));
    }

    @PostMapping("/decisions/{id}/objection")
    public ApiResponse<ObjectionResult> objection(@PathVariable Long id) {
        return ApiResponse.ok(flowService.objection(id));
    }

    @PostMapping("/objections/{objectionId}/answer")
    public ApiResponse<AnswerResult> answerObjection(@PathVariable Long objectionId,
                                                     @RequestBody Map<String, String> body) {
        return ApiResponse.ok(flowService.answerObjection(objectionId, body.get("answer")));
    }

    @PostMapping("/objections/{objectionId}/resolve")
    public ApiResponse<DecisionResponse> resolveObjection(@PathVariable Long objectionId,
                                                          @RequestBody Map<String, String> body) {
        return ApiResponse.ok(flowService.resolveObjection(objectionId, body.get("resolution")));
    }
}
