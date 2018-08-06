// Basic configuration - Environment variable mapping.

module.exports = {
  server_port:   process.env.SERVER_PORT || 8080,
  redis_host:    process.env.REDIS_HOST,
  redis_port:    process.env.REDIS_PORT  || 6379,
  kafka_servers: process.env.KAFKA_SERVERS,
  kafka_enabled: isEmpty(process.env.KAFKA_SERVERS) ? false : true,
}

function isEmpty(str) { return (!str || 0 === str.length) }
