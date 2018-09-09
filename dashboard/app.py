from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO, join_room, emit
from kafka import KafkaConsumer

import os, threading, time

app = Flask(__name__)
socketio = SocketIO(app)

## ----------------------------------------------------------------------------
## Consumer
##
## Consumer from the kafka topics and emit the messages via websockets
## to the relevant webclients.
## ----------------------------------------------------------------------------

class Consumer(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.stop_event = threading.Event()

    def stop(self):
        self.stop_event.set()

    def run(self):
        server = os.getenv("KAFKA_SERVERS", "localhost:9092")
        print ("Connecting to kafka on: ",server)
        consumer = KafkaConsumer(bootstrap_servers=[server],
                                 auto_offset_reset='earliest',
                                 consumer_timeout_ms=1000)
        consumer.subscribe(['newgame', 'connect', 'disconnect', 'score', 'highscore'])
        while not self.stop_event.is_set():
            for message in consumer:
                print("received "+str(message.value)+" on topic "+str(message.topic))
                socketio.emit(str(message.topic), str(message.value), namespace='/dashboard')
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
            socketio.emit('ping')
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
## routes
## ----------------------------------------------------------------------------

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

@app.route("/")
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
