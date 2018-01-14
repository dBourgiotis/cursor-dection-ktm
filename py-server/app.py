from flask import Flask
from flask import request
from flask_cors import CORS
from pandas import json
from flask import jsonify
import pandas as pd
from flask_pymongo import PyMongo
import matplotlib.pyplot as plt
import numpy as np
from scipy import ndimage

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
    resampledList = dataFrameToList(resampled)
    smoothed = smooth(resampledList)
    # add to db
    # output = {'resampled': add_to_database(dataFrameToList(resampled)), 'raw': template, 'smoothed': smoothed} 
    output = {'resampled': listToObjects(resampledList), 'raw': template, 'smoothed': listToObjects(smoothed)} 
    return jsonify(output)

def smooth(object):
    # convert both to arrays
    x_sm = np.array(object['x'])
    y_sm = np.array(object['y'])
    sigma = 7
    x_g1d = ndimage.gaussian_filter1d(x_sm, sigma)
    y_g1d = ndimage.gaussian_filter1d(y_sm, sigma)
    xList = []
    yList = []
    index = 0
    # convert np ints to int
    for x in x_g1d:
        xList.append(int(x))
        yList.append(int(y_g1d[index]))
        index +=1
    return { 't': object['t'], 'x': xList, 'y': yList }

def resample(item):
    data = pd.DataFrame(item)
    data = data.set_index(['t'])
    data.index = pd.to_datetime(data.index, unit='ms')
    resampled = data.resample('50L').fillna(method='bfill')
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
    return {'t': tList, 'x': xList, 'y':yList}

def listToObjects(data):
    xList = data['x']
    yList = data['y']
    tList = data['t']
    list = []
    i = 0
    for x in xList:
        list.append({'x': x, 'y': yList[i], 't': tList[i].timestamp() * 1000})
        i = i + 1
    return list

if __name__ == '__main__':
    app.run(debug=True)