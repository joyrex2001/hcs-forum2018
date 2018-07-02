// Basic configuration - Environment variable mapping.

module.exports = {
  server_port:    process.env.SERVER_PORT    || 8080,
  kafka_host:     process.env.KAFKA_HOST     || "",
  zookeeper_port: process.env.ZOOKEEPER_PORT || 2181,
  enable_kafka:   process.env.ENABLE_KAFKA ? true : false
}
