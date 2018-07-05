FROM maven:3.5-jdk-8-alpine

WORKDIR /app
ADD . /app
RUN mvn install

CMD ["java","-jar","/app/target/highscore-0.1.0.jar"]
