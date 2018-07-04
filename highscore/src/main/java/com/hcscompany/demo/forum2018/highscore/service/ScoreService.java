package com.hcscompany.demo.forum2018.highscore.service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

public interface ScoreService {

    Optional<ScoreModel> get(String id) throws IOException;
    String put(ScoreModel model) throws IOException;
    void update(ScoreModel model) throws IOException;
    void delete(String id) throws IOException;

    List<ScoreModel> listUserScores(String pageId) throws IOException;
    List<ScoreModel> listTopScores(Integer amount) throws IOException;
}