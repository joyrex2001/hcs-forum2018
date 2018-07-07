package com.hcscompany.demo.forum2018.highscore.bus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

public class ReceiverDeserialize extends JsonDeserializer<ScoreModel> {
    private static final Logger LOGGER = LoggerFactory.getLogger(Receiver.class);

    @Override
    public ScoreModel deserialize(String topic, byte[] data) {
        try {
            return super.deserialize(topic, data);
        } catch (Exception e) {
            LOGGER.error("Problem deserializing data " + new String(data) + " on topic " + topic, e);
            return null;
        }
    }
}
