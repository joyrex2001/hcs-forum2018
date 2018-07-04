package com.hcscompany.demo.forum2018.highscore.rest;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hcscompany.demo.forum2018.highscore.service.ScoreService;
import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

@RestController
public class ReadController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReadController.class);

    @Autowired
    private ScoreService service;

    @GetMapping(value = "/score/{id}")
    public ResponseEntity<ScoreModel> getScore(@PathVariable(value = "id") String id) throws IOException {
        Optional<ScoreModel> score = service.get(id);
        return new ResponseEntity<ScoreModel>(score.get(), HttpStatus.OK);
    }

    @GetMapping(value = "/player/{id}/score")
    public ResponseEntity<List<ScoreModel>> getUserScores(@PathVariable(value = "id") String id) throws IOException {
        List<ScoreModel> scores = service.listPlayerScores(id);
        return new ResponseEntity<List<ScoreModel>>(scores, HttpStatus.OK);
    }

    @GetMapping(value = "/highscore")
    public ResponseEntity<List<ScoreModel>> getHighscores() throws IOException {
        List<ScoreModel> scores = service.listTopScores(10);
        return new ResponseEntity<List<ScoreModel>>(scores, HttpStatus.OK);
    }

    @ExceptionHandler(FileNotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public void handle404(Exception ex, Locale locale) {
        LOGGER.debug("Resource not found {}", ex.getMessage());
    }
}