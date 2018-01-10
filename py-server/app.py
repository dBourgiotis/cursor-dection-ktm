from flask import Flask
from flask import request
from flask_cors import CORS
from pandas import json
from flask import jsonify

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Python Server for the ktm app!"

# endpoint to create new template
@app.route("/api/v1/template", methods=["POST"])
# @cross_origin()
def add_template():
    template = request.json['template']
    
    new_template= {'template' :template}

    return jsonify(new_template)

if __name__ == '__main__':
    app.run(debug=True)