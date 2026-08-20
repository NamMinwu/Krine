package com.krine.decision;

import com.krine.decision.enums.Verdict;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// 불변 원본 원칙: 생성 후 수정하지 않는다 (@Setter 없음, append-only)
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int versionNo;

    @Column(length = 1000)
    private String conclusion;

    @Enumerated(EnumType.STRING)
    private Verdict verdict;

    @Column(length = 2000)
    private String reason;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
