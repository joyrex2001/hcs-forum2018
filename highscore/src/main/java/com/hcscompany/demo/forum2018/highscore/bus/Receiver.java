package com.hcscompany.demo.forum2018.highscore.bus;

import java.io.IOException;

import com.google.gson.Gson;
import io.micrometer.core.instrument.Metrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.hcscompany.demo.forum2018.highscore.service.ScoreService;
import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

@Component
public class Receiver {

    private static final Logger LOGGER = LoggerFactory.getLogger(Receiver.class);

    @Autowired
    private Sender sender;

    @Autowired
    private ScoreService service;

    @KafkaListener(topics = "${kafka.topic.score}")
    public void receive(ScoreModel score) throws IOException {
        LOGGER.info("received payload='{}'", new Gson().toJson(score));
        service.put(score);
        Metrics.counter("bus.put_score").increment();
        sender.emitHighScores();
    }
}