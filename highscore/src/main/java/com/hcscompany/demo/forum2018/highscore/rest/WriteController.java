package com.hcscompany.demo.forum2018.highscore.rest;

import io.micrometer.core.instrument.Metrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.EmptyResultDataAccessException;

import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;
import com.hcscompany.demo.forum2018.highscore.service.ScoreService;
import com.hcscompany.demo.forum2018.highscore.bus.Sender;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Locale;

@RestController
public class WriteController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WriteController.class);

    @Autowired
    private ScoreService service;

    @Autowired
    private Sender sender;

    @PostMapping(value = "/score")
    public ResponseEntity<ScoreModel> postScore(@RequestBody ScoreModel score) throws IOException {
        service.update(score);
        sender.emitHighScores();
        Metrics.counter("rest.post_score").increment();
        return new ResponseEntity<ScoreModel>(score, HttpStatus.OK);
    }

    @PutMapping(value = "/score")
    public ResponseEntity<ScoreModel> putScore(@RequestBody ScoreModel score) throws IOException {
        service.put(score);
        sender.emitHighScores();
        Metrics.counter("rest.put_score").increment();
        return new ResponseEntity<ScoreModel>(score, HttpStatus.OK);
    }

    @DeleteMapping(value = "/score/{id}")
    public ResponseEntity<Void> deleteScore(@PathVariable(value = "id") String id) throws IOException {
        try {
            service.delete(id);
        } catch(EmptyResultDataAccessException e) {
            LOGGER.info("not deleting score record with id {}, record does not exist", id);
            return new ResponseEntity<Void>(HttpStatus.NOT_FOUND);
        };
        sender.emitHighScores();
        Metrics.counter("rest.delete_score").increment();
        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
    }

    @ExceptionHandler(FileNotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public void handle404(Exception ex, Locale locale) {
        LOGGER.debug("Resource not found {}", ex.getMessage());
    }
}