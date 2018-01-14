from flask import Flask
from flask import request
from flask_cors import CORS
from pandas import json
from flask import jsonify
import pandas as pd
from flask_pymongo import PyMongo

app = Flask(__name__)
CORS(app)
mongo = PyMongo(app)

app.config['MONGO_DBNAME'] = 'ktm_db'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/ktm_db'

@app.route("/")
def hello():
    return "Python Server for the ktm app!"

# endpoint to create new template
@app.route("/api/v1/template", methods=["POST"])
# @cross_origin()
def add_template():
    template = request.json['template']
    # resample
    resampled = resample(transformToList(template))
    # add to db
    output = {'resampled': add_to_database(dataFrameToList(resampled)), 'raw': template} 
    return jsonify(output)

def resample(item):
    data = pd.DataFrame(item)
    data = data.set_index(['t'])
    data.index = pd.to_datetime(data.index, unit='ms')
    print(data)
    resampled = data.resample('50L').fillna(method='bfill')
    print(resampled)
    return resampled

def transformToList(array):
    tList = []
    xList = []
    yList = []
    for item in array:
        tList.append(item['t'])
        xList.append(item['x'])
        yList.append(item['y'])
    return {'t': tList, 'x': xList, 'y': yList}
        

def add_to_database(item):
    db = mongo.db.ktm_db
    template_id = db.insert({'template' :item})
    new_template = db.find_one({'_id': template_id })
    output = new_template['template']
    return output

def dataFrameToList(data):
    xList = data['x'].values.tolist()
    yList = data['y'].values.tolist()
    tList = data.index.tolist()
    list = []
    i = 0
    for x in xList:
        list.append({'x': x, 'y': yList[i], 't': tList[i].timestamp() * 1000})
        i = i + 1
    return list

if __name__ == '__main__':
    app.run(debug=True)