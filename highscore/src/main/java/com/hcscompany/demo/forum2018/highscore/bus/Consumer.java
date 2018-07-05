package com.hcscompany.demo.forum2018.highscore.bus;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class Consumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(Consumer.class);

    /*
    // As Kafka can not guarantee a single fetch by one consumer (as RabbitMQ does),
    // the addition of a new score is done via the rest api instead.
    @KafkaListener(topics = "${kafka.topic.score}")
    public void receive(ConsumerRecord<?, ?> consumerRecord) {
        LOGGER.info("received payload='{}'", consumerRecord.toString());
    }
    */
}