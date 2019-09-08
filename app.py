from flask import Flask, redirect, url_for, request, render_template
from gevent.pywsgi import WSGIServer

app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


if __name__ == '__main__':
    http_server = WSGIServer(('0.0.0.0', 5000), app)
    http_server.serve_forever()
