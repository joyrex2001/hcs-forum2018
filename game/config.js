// Basic configuration - Environment variable mapping.

module.exports = {
  server_port:   process.env.SERVER_PORT || 8080,
  redis_host:    process.env.REDIS_HOST,
  redis_port:    process.env.REDIS_PORT  || 6379,
  kafka_servers: process.env.KAFKA_SERVERS,
  kafka_enabled: isEmpty(process.env.KAFKA_SERVERS) ? false : true,
  disable_push:  Bool(process.env.DISABLE_PUSH)
}

function isEmpty(str) { return (!str || 0 === str.length) }

function Bool(str) {
  if (isEmpty(str)) return false;
  if (str.toLowerCase() == 'true') return true;
  return false;
}
