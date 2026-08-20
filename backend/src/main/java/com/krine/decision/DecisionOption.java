package com.krine.decision;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;

    @ElementCollection
    @Builder.Default
    private List<String> gains = new ArrayList<>();

    @ElementCollection
    @Builder.Default
    private List<String> sacrifices = new ArrayList<>();
}
