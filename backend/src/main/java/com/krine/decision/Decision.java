package com.krine.decision;

import com.krine.decision.enums.DecisionStatus;
import com.krine.decision.enums.FlowStep;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Decision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String situation;

    private String topicTag;

    @Column(length = 4000)
    private String rawDiary;

    @Column(length = 1000)
    private String firstExpression;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DecisionStatus status = DecisionStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FlowStep flowStep = FlowStep.DIARY;

    @ElementCollection
    @Builder.Default
    private List<String> criteria = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "decision_id")
    @Builder.Default
    private List<DecisionOption> options = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "decision_id")
    @OrderBy("versionNo ASC")
    @Builder.Default
    private List<DecisionVersion> versions = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "decision_id")
    @Builder.Default
    private List<Condition> conditions = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "decision_id")
    @Builder.Default
    private List<Objection> objections = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "decision_id")
    @OrderBy("id ASC")
    @Builder.Default
    private List<FlowMessage> messages = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
