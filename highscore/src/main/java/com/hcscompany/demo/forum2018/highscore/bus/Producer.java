package com.hcscompany.demo.forum2018.highscore.bus;

import java.io.IOException;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.hcscompany.demo.forum2018.highscore.service.ScoreService;
import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

@Component
public class Producer {

    private static final Logger LOGGER = LoggerFactory.getLogger(Producer.class);

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
        send("highscore", gson.toJson(scores));
    }

}