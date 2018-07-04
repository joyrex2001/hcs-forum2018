package com.hcscompany.demo.forum2018.highscore.model;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

public interface ScoreModelRepository extends CrudRepository<ScoreModel, String> {

    @Query("select a from ScoreModel a where a.playerId = ?1")
    List<ScoreModel> findByPlayerId(String playerId);

    @Query("select a from ScoreModel a order by a.score desc, a.creationDate asc")
    List<ScoreModel> findTopScores(Pageable pageable);
}