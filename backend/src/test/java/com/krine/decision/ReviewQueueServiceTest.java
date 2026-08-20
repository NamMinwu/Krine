package com.krine.decision;

import com.krine.decision.dto.ReviewQueueItem;
import com.krine.decision.enums.ChallengeResolution;
import com.krine.decision.enums.ConditionType;
import com.krine.decision.enums.DecisionStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(ReviewQueueService.class)
class ReviewQueueServiceTest {
    @Autowired
    DecisionRepository repository;
    @Autowired
    ReviewQueueService queue;

    @Test
    void 만료된_시점형_조건과_보류_반론만_큐에_담긴다() {
        Decision active = Decision.builder().title("휴대폰").status(DecisionStatus.ACTIVE).build();
        active.getConditions().add(Condition.builder().text("약정 만료").type(ConditionType.DATE)
                .dueDate(LocalDate.of(2026, 8, 19)).build());              // 어제 → 포함
        active.getConditions().add(Condition.builder().text("미래 조건").type(ConditionType.DATE)
                .dueDate(LocalDate.of(2026, 12, 1)).build());              // 미래 → 제외
        active.getConditions().add(Condition.builder().text("기기 고장").type(ConditionType.EVENT).build()); // 체크인 → 포함
        active.getChallenges().add(Challenge.builder().objection("더 좋은 모델이 나올 수 있다")
                .resolution(ChallengeResolution.DEFERRED).build());        // 보류 → 포함
        repository.save(active);

        Decision draft = Decision.builder().title("작성중").status(DecisionStatus.DRAFT).build();
        draft.getConditions().add(Condition.builder().text("draft 조건").type(ConditionType.DATE)
                .dueDate(LocalDate.of(2026, 8, 1)).build());               // DRAFT → 제외
        repository.save(draft);

        List<ReviewQueueItem> items = queue.getQueue(LocalDate.of(2026, 8, 20));

        assertThat(items).extracting(ReviewQueueItem::kind)
                .containsExactlyInAnyOrder("DUE_DATE", "EVENT_CHECKIN", "DEFERRED_CHALLENGE");
        assertThat(items).extracting(ReviewQueueItem::text)
                .contains("약정 만료", "기기 고장", "더 좋은 모델이 나올 수 있다");
    }
}
