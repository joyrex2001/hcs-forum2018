// Basic configuration - Environment variable mapping.

module.exports = {
  server_port:       process.env.SERVER_PORT || 8080,
  kafka_servers:     process.env.KAFKA_SERVERS,
  enable_kafka:      isEmpty(process.env.KAFKA_SERVERS) ? false : true,
}

function isEmpty(str) { return (!str || 0 === str.length) }
