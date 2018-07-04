package com.hcscompany.demo.forum2018.highscore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class Application {

    private static final Logger logger = LoggerFactory.getLogger(CommandLineAppStartupRunner.class);

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return new CommandLineAppStartupRunner();
    }

    public class CommandLineAppStartupRunner implements CommandLineRunner {
        @Override
        public void run(String... args) throws Exception {
            logger.info("Application started with command-line arguments: {}", Arrays.toString(args));
        }
    }

}
