package com.krine.decision;

import com.krine.decision.dto.ReviewQueueItem;
import com.krine.decision.enums.ChallengeResolution;
import com.krine.decision.enums.ConditionStatus;
import com.krine.decision.enums.ConditionType;
import com.krine.decision.enums.DecisionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewQueueService {
    private final DecisionRepository repository;

    public List<ReviewQueueItem> getQueue(LocalDate today) {
        List<ReviewQueueItem> items = new ArrayList<>();
        for (Decision d : repository.findAll()) {
            if (d.getStatus() != DecisionStatus.ACTIVE) {
                continue;
            }
            for (Condition c : d.getConditions()) {
                if (c.getStatus() != ConditionStatus.PENDING) {
                    continue;
                }
                if (c.getType() == ConditionType.DATE && c.getDueDate() != null && !c.getDueDate().isAfter(today)) {
                    items.add(new ReviewQueueItem(d.getId(), d.getTitle(), "DUE_DATE", c.getId(), c.getText(), c.getDueDate()));
                } else if (c.getType() == ConditionType.EVENT) {
                    items.add(new ReviewQueueItem(d.getId(), d.getTitle(), "EVENT_CHECKIN", c.getId(), c.getText(), null));
                }
            }
            for (Challenge ch : d.getChallenges()) {
                if (ch.getResolution() == ChallengeResolution.DEFERRED) {
                    items.add(new ReviewQueueItem(d.getId(), d.getTitle(), "DEFERRED_CHALLENGE", ch.getId(), ch.getObjection(), null));
                }
            }
        }
        return items;
    }
}
