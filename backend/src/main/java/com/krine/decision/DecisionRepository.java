package com.krine.decision;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
    @Query("select d from Decision d join d.objections c where c.id = :objectionId")
    Optional<Decision> findByObjectionId(@Param("objectionId") Long objectionId);
}
