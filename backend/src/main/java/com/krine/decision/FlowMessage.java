package com.krine.decision;

import com.krine.decision.enums.MessageRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MessageRole role;

    @Column(length = 4000)
    private String content;

    // 질문 선택지 (JSON 배열 문자열, USER 메시지는 null)
    @Column(length = 2000)
    private String choicesJson;
}
