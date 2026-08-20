package com.krine.decision;

import com.krine.common.InvalidStateException;
import com.krine.decision.dto.ConditionInput;
import com.krine.decision.dto.OptionInput;
import com.krine.decision.dto.ReviewInput;
import com.krine.decision.dto.StructureInput;
import com.krine.decision.enums.ConditionStatus;
import com.krine.decision.enums.DecisionStatus;
import com.krine.decision.enums.Verdict;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(DecisionService.class)
class DecisionServiceTest {
    @Autowired
    DecisionService service;

    private Long draftWithStructure() {
        Decision d = service.createDraft("오늘 회의에서 기존 방식으로 가기로 했다");
        service.updateStructure(d.getId(), new StructureInput(
                "기존 방식 유지 vs 새 방식 도입", "일정 압박 상황", "업무",
                List.of("일정"),
                List.of(new OptionInput("기존 방식 유지", List.of("일정 준수"), List.of("장기 효율"), List.of("이번 분기 일정이 가장 중요하다"))),
                List.of(new ConditionInput("다음 분기 일정 여유", "DATE", java.time.LocalDate.now().plusDays(30)))));
        return d.getId();
    }

    @Test
    void confirm은_ACTIVE_전환과_INITIAL_버전을_만든다() {
        Long id = draftWithStructure();
        Decision d = service.confirm(id, "기존 방식을 유지한다", "그냥 일정 때문에");
        assertThat(d.getStatus()).isEqualTo(DecisionStatus.ACTIVE);
        assertThat(d.getVersions()).hasSize(1);
        assertThat(d.getVersions().get(0).getVerdict()).isEqualTo(Verdict.INITIAL);
    }

    @Test
    void 확정된_판단의_구조는_수정할_수_없다() {
        Long id = draftWithStructure();
        service.confirm(id, "기존 방식을 유지한다", null);
        assertThatThrownBy(() -> service.updateStructure(id, new StructureInput(
                "제목 변경", null, null, List.of(), List.of(), List.of())))
                .isInstanceOf(InvalidStateException.class);
    }

    @Test
    void review는_새_버전을_추가하고_원본_버전은_그대로_둔다() {
        Long id = draftWithStructure();
        Decision confirmed = service.confirm(id, "기존 방식을 유지한다", null);
        Long condId = confirmed.getConditions().get(0).getId();

        Decision reviewed = service.review(id, new ReviewInput("REVERSED", "일정 여유가 생김", "새 방식을 도입한다", condId));

        assertThat(reviewed.getVersions()).hasSize(2);
        assertThat(reviewed.getVersions().get(0).getConclusion()).isEqualTo("기존 방식을 유지한다");
        assertThat(reviewed.getVersions().get(1).getVerdict()).isEqualTo(Verdict.REVERSED);
        assertThat(reviewed.getConditions().get(0).getStatus()).isEqualTo(ConditionStatus.TRIGGERED);
    }

    @Test
    void DRAFT에는_review할_수_없다() {
        Long id = draftWithStructure();
        assertThatThrownBy(() -> service.review(id, new ReviewInput("MAINTAINED", "이유", null, null)))
                .isInstanceOf(InvalidStateException.class);
    }
}
