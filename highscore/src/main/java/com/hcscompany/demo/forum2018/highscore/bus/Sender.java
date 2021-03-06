package com.hcscompany.demo.forum2018.highscore.bus;

import java.io.IOException;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.micrometer.core.instrument.Metrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.hcscompany.demo.forum2018.highscore.service.ScoreService;
import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

@Component
public class Sender {

    private static final Logger LOGGER = LoggerFactory.getLogger(Sender.class);

    @Value("${kafka.topic.highscore}")
    private String highscoreTopic;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ScoreService service;

    private void send(String topic, String payload) {
        LOGGER.info("sending payload='{}' to topic='{}'", payload, topic);
        kafkaTemplate.send(topic, payload);
    }

    public void emitHighScores()  throws IOException {
        List<ScoreModel> scores = service.listTopScores(10);
        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        Metrics.counter("bus.send_score").increment();
        send(highscoreTopic, gson.toJson(scores));
    }

}