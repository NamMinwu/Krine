package com.krine.flow;

import com.krine.decision.DecisionService;
import com.krine.flow.dto.ObjectionResult;
import com.krine.flow.dto.DiscoverResult;
import com.krine.flow.dto.NextQuestion;
import com.krine.flow.dto.StructureDraft;
import com.krine.llm.LlmPort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({FlowService.class, DecisionService.class, FlowServiceTest.FakeLlmConfig.class})
class FlowServiceTest {
    @TestConfiguration
    static class FakeLlmConfig {
        @Bean
        LlmPort llmPort() {
            return (sys, user) -> {
                if (user.contains("[DISCOVER]")) {
                    return "{\"title\":\"휴대폰을 지금 바꿀까?\",\"optionA\":\"지금 산다\",\"optionB\":\"기다린다\",\"message\":\"판단으로 기록해볼 수 있어요.\"}";
                }
                if (user.contains("[QUESTION]")) {
                    return "{\"question\":\"가장 중요하게 본 기준은 무엇이었나요?\",\"choices\":[\"비용\",\"편의\",\"직접 입력\"],\"targets\":\"criteria\"}";
                }
                if (user.contains("[STRUCTURE]")) {
                    return "{\"title\":\"휴대폰을 지금 바꿀까?\",\"situation\":\"약정 5개월\",\"topicTag\":\"구매\",\"criteria\":[\"편의\"],\"options\":[{\"label\":\"지금 산다\",\"gains\":[\"새 기기\"],\"sacrifices\":[\"약정 비용\"],\"premises\":[\"불편이 크다\"]}],\"conditions\":[{\"text\":\"기기 고장\",\"type\":\"EVENT\",\"dueDate\":null}],\"suggestedReviewDate\":\"2026-09-19\"}";
                }
                if (user.contains("[OBJECTION]")) {
                    return "{\"perspective\":\"비용 관점\",\"objection\":\"5개월 뒤가 더 쌀 수 있어요. 어떻게 보시나요?\"}";
                }
                if (user.contains("[REFLECT]")) {
                    return "{\"reflectBack\":\"미래 가격보다 현재 불편을 중요하게 보시는군요. 맞나요?\"}";
                }
                throw new IllegalArgumentException("unknown marker");
            };
        }
    }

    @Autowired
    FlowService flow;
    @Autowired
    DecisionService decisions;

    @Test
    void discover는_판단_후보를_반환하고_대화를_저장한다() {
        Long id = decisions.createDraft("배터리가 빨리 닳아서 고민").getId();
        DiscoverResult r = flow.discover(id);
        assertThat(r.title()).contains("휴대폰");
        assertThat(decisions.get(id).getMessages()).isNotEmpty();
    }

    @Test
    void 질문은_4개를_넘지_않는다() {
        Long id = decisions.createDraft("고민").getId();
        flow.discover(id);
        NextQuestion q = null;
        // 답변 4개 → 질문 4개 생성, 5번째 호출에서 done
        for (int i = 0; i < 5; i++) {
            q = flow.answer(id, "답변 " + i);
        }
        assertThat(q.done()).isTrue();
        assertThat(q.progress()).isEqualTo(FlowService.MAX_QUESTIONS);
    }

    @Test
    void structureDraft는_조건_분류와_재검토일_제안을_담는다() {
        Long id = decisions.createDraft("고민").getId();
        StructureDraft d = flow.structureDraft(id);
        assertThat(d.conditions().get(0).type()).isEqualTo("EVENT");
        assertThat(d.suggestedReviewDate()).isNotNull();
    }

    @Test
    void 반박은_제한_없이_계속_받을_수_있다() {
        Long id = decisions.createDraft("고민").getId();
        flow.structureDraft(id);
        flow.objection(id);
        flow.objection(id);
        ObjectionResult third = flow.objection(id);
        assertThat(third.objectionId()).isNotNull();
        assertThat(decisions.get(id).getObjections()).hasSize(3);
    }

    @Test
    void 반론_답변과_종결_처리() {
        Long id = decisions.createDraft("고민").getId();
        ObjectionResult c = flow.objection(id);
        assertThat(flow.answerObjection(c.objectionId(), "업무 중 충전이 반복돼서요").reflectBack())
                .contains("맞나요");
        var response = flow.resolveObjection(c.objectionId(), "DEFERRED");
        assertThat(response.objections().get(0).resolution()).isEqualTo("DEFERRED");
    }
}
