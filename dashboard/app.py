import eventlet
eventlet.monkey_patch()

from flask import Flask, make_response, render_template, send_from_directory, request
from flask_socketio import SocketIO, join_room, emit
from kafka import KafkaConsumer
import os, threading, time, logging, functools

## ----------------------------------------------------------------------------
## configuration of dashboard - use the below environment variables
## ----------------------------------------------------------------------------

config = {
  "KAFKA_SERVERS": os.getenv("KAFKA_SERVERS", "localhost:9092"),
  "USERNAME":      os.getenv("USERNAME"),
  "PASSWORD":      os.getenv("PASSWORD")
}

logging.basicConfig(format='%(asctime)s [%(levelname)s] %(message)s', level=logging.ERROR)

## ----------------------------------------------------------------------------

app = Flask(__name__)
socketio = SocketIO(app, async_mode='eventlet')

## ----------------------------------------------------------------------------
## Consumer
##
## Consumer from the kafka topics and emit the messages via websockets
## to the relevant webclients.
## ----------------------------------------------------------------------------

highscore = ""
class Consumer(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.stop_event = threading.Event()

    def stop(self):
        self.stop_event.set()

    def run(self):
        server = config["KAFKA_SERVERS"]
        logging.info("Connecting to kafka on: ",server)
        consumer = KafkaConsumer(bootstrap_servers=[server],
                                 auto_offset_reset='earliest',
                                 consumer_timeout_ms=1000)
        consumer.subscribe(['newgame', 'connect', 'disconnect', 'score', 'highscore'])
        while not self.stop_event.is_set():
            for message in consumer:
                topic = str(message.topic)
                value = str(message.value.decode('utf8'))
                logging.info("received "+value+" on topic "+topic)
                if topic == "highscore":
                    global highscore
                    highscore = value ## whistles...
                socketio.emit("topic_"+topic,value,broadcast=True)
                if self.stop_event.is_set():
                    break

## ----------------------------------------------------------------------------
## Ping
##
## Send a regular keep-alive ping message to the relevent webclients to make
## sure they will not disconnect.
## ----------------------------------------------------------------------------

class Ping(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.stop_event = threading.Event()

    def stop(self):
        self.stop_event.set()

    def run(self):
        while not self.stop_event.is_set():
            logging.debug("send ping")
            socketio.emit('ping','pong',broadcast=True)
            time.sleep(10)
            if self.stop_event.is_set():
                break

## ----------------------------------------------------------------------------
## Watcher
##
## Watcher will check if all tasks are still running, and exit if one is not.
## ----------------------------------------------------------------------------

class Watch(threading.Thread):
    def __init__(self,tasks):
        self.tasks = tasks
        threading.Thread.__init__(self)
        self.stop_event = threading.Event()

    def stop(self):
        self.stop_event.set()

    def run(self):
        while not self.stop_event.is_set():
            for task in self.tasks:
                if not task.isAlive():
                    print(task)
                    os._exit(1)
            if self.stop_event.is_set():
                os._exit(1)
            time.sleep(2)

## ----------------------------------------------------------------------------
## authentication
## ----------------------------------------------------------------------------

def ok_user_and_password(username, password):
    return username == config["USERNAME"] and password == config["PASSWORD"]

def authenticate():
    resp = make_response(render_template('unauthorized.html'))
    resp.status_code = 401
    resp.headers['WWW-Authenticate'] = 'Basic realm="Main"'
    return resp

def requires_authorization(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if config["USERNAME"] == '' or config["USERNAME"] is None:
            return f(*args, **kwargs)
        auth = request.authorization
        if not auth or not ok_user_and_password(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

## ----------------------------------------------------------------------------
## routes
## ----------------------------------------------------------------------------

@socketio.on('connect')
def connect_event():
    logging.debug("received connect")
    logging.info("broadcast highscores: "+highscore)
    emit('topic_highscore', highscore, broadcast=True)

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('static/', path)

@app.route("/")
@requires_authorization
def index():
    return render_template('index.html')

## ----------------------------------------------------------------------------
## To the bat-mobile, let's go!
## ----------------------------------------------------------------------------

def main():
    ## start some threads, watch them...
    tasks = [ Consumer(), Ping() ]
    for task in tasks:
        task.start()
    Watch(tasks).start()
    ## ...and state the web stuff!
    socketio.run(app, host="0.0.0.0")

## ----------------------------------------------------------------------------
if __name__ == "__main__":
    main()
