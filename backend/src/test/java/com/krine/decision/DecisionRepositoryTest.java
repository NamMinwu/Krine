package com.krine.decision;

import com.krine.decision.enums.ConditionType;
import com.krine.decision.enums.DecisionStatus;
import com.krine.decision.enums.Verdict;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class DecisionRepositoryTest {
    @Autowired
    DecisionRepository repository;

    @Test
    void 판단_애그리거트_저장_후_자식까지_로드된다() {
        Decision d = Decision.builder().title("휴대폰을 지금 바꿀까?").rawDiary("배터리가...").build();
        d.getOptions().add(DecisionOption.builder().label("지금 산다").build());
        d.getConditions().add(Condition.builder()
                .text("약정 만료").type(ConditionType.DATE)
                .dueDate(LocalDate.of(2026, 1, 5)).build());
        d.getVersions().add(DecisionVersion.builder()
                .versionNo(1).conclusion("지금 산다").verdict(Verdict.INITIAL).build());

        Long id = repository.saveAndFlush(d).getId();
        Decision loaded = repository.findById(id).orElseThrow();

        assertThat(loaded.getOptions()).hasSize(1);
        assertThat(loaded.getConditions().get(0).getType()).isEqualTo(ConditionType.DATE);
        assertThat(loaded.getVersions().get(0).getVerdict()).isEqualTo(Verdict.INITIAL);
        assertThat(loaded.getStatus()).isEqualTo(DecisionStatus.DRAFT);
    }
}
