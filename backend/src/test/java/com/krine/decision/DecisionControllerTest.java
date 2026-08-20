package com.krine.decision;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DecisionControllerTest {
    @Autowired
    MockMvc mvc;

    @Test
    void 판단_생성_구조화_확정_흐름() throws Exception {
        String body = mvc.perform(post("/api/decisions").contentType(APPLICATION_JSON)
                        .content("{\"rawDiary\":\"오늘 회의에서...\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();
        Long id = com.jayway.jsonpath.JsonPath.parse(body).read("$.data.id", Long.class);

        mvc.perform(put("/api/decisions/" + id + "/structure").contentType(APPLICATION_JSON)
                        .content("""
                                {"title":"기존 vs 새 방식","situation":"일정 압박","topicTag":"업무",
                                 "criteria":["일정"],
                                 "options":[{"label":"기존 유지","gains":["일정 준수"],"sacrifices":["장기 효율"]}],
                                 "conditions":[{"text":"다음 분기 여유","type":"DATE","dueDate":"2026-10-01"}]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("기존 vs 새 방식"));

        mvc.perform(post("/api/decisions/" + id + "/confirm").contentType(APPLICATION_JSON)
                        .content("{\"conclusion\":\"기존 방식을 유지한다\",\"firstExpression\":\"그냥 일정 때문에\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.versions[0].verdict").value("INITIAL"));
    }

    @Test
    void 없는_판단은_404_envelope로_돌아온다() throws Exception {
        mvc.perform(get("/api/decisions/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void 재검토_큐_조회() throws Exception {
        mvc.perform(get("/api/review-queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
