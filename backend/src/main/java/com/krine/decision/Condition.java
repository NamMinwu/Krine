package com.krine.decision;

import com.krine.decision.enums.ConditionStatus;
import com.krine.decision.enums.ConditionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "decision_condition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Condition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String text;

    @Enumerated(EnumType.STRING)
    private ConditionType type;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ConditionStatus status = ConditionStatus.PENDING;
}
