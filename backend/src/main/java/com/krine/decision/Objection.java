package com.krine.decision;

import com.krine.decision.enums.ObjectionResolution;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Objection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String perspective;

    @Column(length = 1000)
    private String objection;

    @Column(length = 2000)
    private String userAnswer;

    @Column(length = 1000)
    private String reflectBack;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ObjectionResolution resolution = ObjectionResolution.OPEN;
}
