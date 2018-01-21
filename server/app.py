from flask import Flask
from flask import request
from flask_cors import CORS
from pandas import json
from flask import jsonify
import pandas as pd
from flask_pymongo import PyMongo
import numpy as np
from scipy import ndimage
import math 

app = Flask(__name__)
CORS(app)

app.config['MONGO_DBNAME'] = 'ktm-db'
app.config['MONGO_URI'] = 'mongodb://admin:admin@ds111078.mlab.com:11078/ktm-db'
mongo = PyMongo(app)

scoreArray = []
totalTemplates = []

@app.route("/")
def hello():
    return "Python Server for the ktm app!"

# endpoint to create new template
@app.route("/api/v1/template", methods=["POST"])
def add_template():
    # step 0 get template's data
    template = request.json['template']

    # step 1 overshooting filter
    overshooted = overshootingFilter(template)

    # step 2 resample
    resampled = resample(transformToList(overshooted))
    resampledList = listToObjects(dataFrameToList(resampled))

    # step 3 create velocity profile
    velocityProfile = transformToVelocityProfile(resampledList)

    # step 4 add to db (velocity profile, resampled array, total distance)
    added = add_to_database(overshooted, velocityProfile)

    # Get All documents from db
    totalTemplates = get_from_db()
    print(len(totalTemplates))

    # smoothing test has to be on the velocity profile
    smoothed = smooth(velocityProfile)

    output = {'resampled': velocityProfile, 'smoothed': smoothed, 'temp': added }
    return jsonify(output)

# step 1
def overshootingFilter(template):
    array = []
    i = 0
    for item in template:
        if i == 0:
            array.append(item)
        else:
            # calculate distance of i element from the first element
            dXi = template[i]['x'] - template[0]['x']
            dYi = template[i]['y'] - template[0]['y']
            di = math.sqrt(math.pow(dXi, 2) + math.pow(dYi, 2))

            #  calculate distance of i-1 element from the first element OR with the last item pushed to the array
            dXi_1 = array[len(array) - 1]['x'] - template[0]['x']
            dYi_1 = array[len(array) - 1]['y'] - template[0]['y']
            di_1 = math.sqrt(math.pow(dXi_1, 2) + math.pow(dYi_1, 2))

            if di > di_1:
                array.append(template[i])

        i += 1
    return array


# step 2
def resample(item):
    data = pd.DataFrame(item)
    data = data.set_index(['t'])
    data.index = pd.to_datetime(data.index, unit='ms')
    resampled = data.resample('50L').fillna(method='bfill')
    return resampled

# step 3
def transformToVelocityProfile(template):
    array = []
    # Maybe all the profiles should start from 0
    array.append({'velocity': 0, 'time': 0})
    i = 0
    for i in range(0, len(template) - 1 ): 
        dX = template[i + 1]['x'] - template[i]['x']
        dY = template[i + 1]['y'] - template[i]['y']
        dT = template[i + 1]['t'] - template[i]['t']
        vX = dX / dT
        vY = dY / dT
        # keep only dt
        ti = template[i + 1]['t'] - template[0]['t'] 
        velocity = math.sqrt(math.pow(vX, 2) + math.pow(vY, 2))
        array.append({'velocity': velocity, 'time': ti})
    return array

# step 4
def add_to_database(template, velocityProfile):
    db = mongo.db.templates
    template_id = db.insert({'template' :template, 'velocity_profile': velocityProfile })
    return 'added'

# get all documents
def get_from_db():
    db = mongo.db.templates
    array = []
    for temp in db.find():
        array.append(temp)
    return array

# smoothing
def smooth(object):
    list = transformVelocityToList(object)
    # convert both to arrays
    v_sm = np.array(list['velocity'])
    sigma = 4
    v_g1d = ndimage.gaussian_filter1d(v_sm, sigma)
    smoothed = []
    index = 0
    # convert np ints to int
    for v in v_g1d:
        smoothed.append({'time': list['time'][index], 'velocity': v})
        index +=1
    return smoothed

# utilities
def transformToList(array):
    tList = []
    xList = []
    yList = []
    for item in array:
        tList.append(item['t'])
        xList.append(item['x'])
        yList.append(item['y'])
    return {'t': tList, 'x': xList, 'y': yList}

def transformVelocityToList(array):
    tList = []
    vList = []
    for item in array:
        tList.append(item['time'])
        vList.append(item['velocity'])
    return {'time': tList, 'velocity': vList}

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

def velocityListToObjects(data):
    vList = data['velocity']
    tList = data['time']
    list = []
    i = 0
    for v in vList:
        list.append({'velocity': v, 'time': tList[i]})
        i += 1
    return list

if __name__ == '__main__':
    app.run(debug=True)