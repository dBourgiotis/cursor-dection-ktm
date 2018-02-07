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

@app.route("/")
def hello():
    return "Python Server for the ktm app!"

# endpoint to create new template
@app.route("/api/v1/template", methods=["POST"])
def post_template():
    # step 0 get template's data
    template = request.json['template']
    collectionName = request.json['collectionName']
    output = add_template(template, collectionName)
    return jsonify(output)

def add_template(template, collectionName):
    # step 1 overshooting filter
    overshooted = overshootingFilter(template)

    # step 2 resample
    resampled = resample(transformToList(overshooted))
    resampledList = listToObjects(dataFrameToList(resampled))

    # step 3 create velocity profile
    velocityProfile = transformToVelocityProfile(resampledList)

    # step 4 add to db (velocity profile, resampled array, total distance)
    added = add_to_database(resampledList, velocityProfile, collectionName)

    # smoothing test has to be on the velocity profile
    smoothed = smooth(velocityProfile)

    output = {'resampled': velocityProfile, 'smoothed': smoothed, 'temp': added }
    return output

# endpoint to predict template
@app.route("/api/v1/predict", methods=["POST"])
def predict_template():
    # step 0 get template's data
    template = request.json['template']
    collectionName = request.json['collectionName']
    # step 1 get all templates from db
    totalTemplates = get_from_db(collectionName)
    output = templateMatching(template,totalTemplates,0.9, collectionName)
    return jsonify(output)

# endpoint to add Raw predictions
@app.route("/api/v1/predictions", methods=["POST"])
def get_prediction():
    template = request.json['template']
    collectionName = request.json['collectionName']
    output = add_prediction_to_db({'raw': template}, collectionName)
    return jsonify(output)

# endpoint to add Raw predictions
@app.route("/api/v1/calculate_results", methods=["GET"])
def get_Results():
    params = request.args
    percent = int(params['percent']) / 100
    experimentType = params['experimentType']
    predictions = []
    templates = []
    collectionName = ''
    if experimentType == 'table':
        # get table templates and predictions
        templates = get_from_db('templates')
        predictions = get_from_db('rawPredictionsTable')
        collectionName = 'templates'
    else:
        # get fake news template and predictions
        collectionName = 'finalTemplates'
        templates = get_from_db('finalTemplates')
        predictions = get_from_db('rawPredictionsFakeSite')
    for prediction in predictions:
        result = templateMatching(prediction['raw'], templates,percent, collectionName)

    # results = get_from_db('results')
    # output = {'templates': templates, 'predictions': predictions}
    # print(output)
    return 'test'

def templateMatching(template, totalTemplates, percent, collectionName):
# create score Array 
    scoreArray = {}
    for temp in totalTemplates:
        scoreArray[temp['_id']] = 0
    
    # Calculate the 90% of the movement
    fixedLastElem = math.floor(percent * (len(template)-1))

    # init resampledList
    resampledList = []
    # step 2 for every t coming from template
    for point in range(0, fixedLastElem + 1):
        templateSoFar = []
        # simulate point appending
        for i in range(0, point + 1):
            templateSoFar.append(template[i])
        # process template so far
        overshooted = overshootingFilter(templateSoFar)
        resampled = resample(transformToList(overshooted))
        resampledList = listToObjects(dataFrameToList(resampled))
        velocityProfile = transformToVelocityProfile(resampledList)
        smoothed = smooth(velocityProfile)
        print(len(velocityProfile), len(smoothed))
        # cross all templates
        for temp in totalTemplates:
            if len(temp['velocity_profile']) >= len(smoothed) :
                # temp should be turnacated and then smoothed
                turncatedTemp = []
                for j in range(0, len(smoothed)):
                    turncatedTemp.append(temp['velocity_profile'][j])
                turncatedAndSmootheTemp = smooth(turncatedTemp)
                # case 1
                sum = 0
                for i in range(0, len(smoothed)):
                    sum = sum + abs(smoothed[i]['velocity'] - turncatedAndSmootheTemp[i]['velocity'])
                scoreArray[temp['_id']] = scoreArray[temp['_id']] + sum / len(smoothed)
            else:
                # temp smoothed
                smoothedTemp = smooth(temp['velocity_profile'])
                # case 2
                sum = 0
                for j in range(0, len(smoothedTemp)):
                    sum = sum + abs(smoothed[j]['velocity'] - smoothedTemp[j]['velocity'])
                for x in range(len(smoothedTemp), len(smoothed)):
                    sum = sum + smoothed[j]['velocity']
                scoreArray[temp['_id']] = scoreArray[temp['_id']] + sum / len(smoothed)
    # print(scoreArray)
    min = findMin(scoreArray)
    bestMatch = findElement(min['key'], totalTemplates)
    totalDistance = bestMatch['total_distance']
    
    # find endpoint
    print('Min is ',min)
    endpoint = findEndpoint(template, resampledList, bestMatch['template'], bestMatch['velocity_profile'], totalDistance).copy()
    print('error' in endpoint)
    if len(template) > 1 and not( 'error' in endpoint) :
        print(endpoint)
        output = {'predicted_simple_distance': endpoint['simple_distance'], 'predicted_distance_from_velocity': endpoint['distance_from_velocity'], 'original': template[len(template) - 1], 'total_distance': endpoint['total_distance']}
        temp = output.copy()
        add_result_to_db(temp, collectionName)
        return output
    else: 
        return {'error': ''}


def findMin(object):
    i = 0
    min = {}
    for key in object.keys():
        if i == 0:
            min = { 'key': key, 'value': object[key]}
        else:
            min = { 'key': key, 'value': object[key]} if min['value'] > object[key] else min
        i += 1
    return min

def findElement(id, templates):
    for temp in templates:
        if id == temp['_id']:
            return temp
    return ''

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
    # len has to be - 1 because we use + 1
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
def add_to_database(template, velocityProfile, collectionName):
    db = mongo.db[collectionName]
    final = len(template) - 1
    dX = template[final]['x'] - template[0]['x']
    dY = template[final]['y'] - template[0]['y']
    dt = math.sqrt(math.pow(dX, 2) + math.pow(dY, 2))
    template_id = db.insert({'template' :template, 'velocity_profile': velocityProfile, 'total_distance': dt })
    return 'added'

# get all documents
def get_from_db(collectionName):
    db = mongo.db[collectionName]
    array = []
    for temp in db.find():
        array.append(temp)
    return array

# add prediction results to db
def add_result_to_db(endpoints, collectionName):
    resultCollection = 'wrong'
    if collectionName == 'templates':
        resultCollection = 'results'
    else:
        resultCollection = 'finalResults'
    db = mongo.db[resultCollection]
    db.insert(endpoints)
    return 'added'

# add prediction raw to db
def add_prediction_to_db(endpoints, collectionName):
    rawPredictionsCollection = 'wrong'
    if collectionName == 'templates':
        rawPredictionsCollection = 'rawPredictionsTable'
    else:
        rawPredictionsCollection = 'rawPredictionsFakeSite'
    db = mongo.db[rawPredictionsCollection]
    db.insert(endpoints)
    return 'added' 

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

def findEndpoint(original, list, template, velocityProfile, totalDistance):
    # best match
    distance = 0
    distanceFromVelocity = 0
    if len(template) >= len(list):
        final = len(template)
        dX = template[final-1]['x'] - template[len(list) -1]['x']
        dY = template[final-1]['y'] - template[len(list) -1]['y']
        distance = math.sqrt(math.pow(dX, 2) + math.pow(dY, 2))
        for i in range(len(list), final):
            distanceFromVelocity = distanceFromVelocity + (velocityProfile[i]['velocity'] * (velocityProfile[i]['time'] - velocityProfile[i-1]['time']))

    # should calculate A(x,y) end -1 point & B(x,y) end point of candidate 
    if len(list) <=1:
        endpoint = { 'error': 'length_under_1' }
        return endpoint

    if len(list) > 1:
        xA = list[len(list) -2]['x']
        yA = list[len(list) -2]['y']
        xB = list[len(list) -1]['x']
        yB = list[len(list) -1]['y']
    else :
        xB = list[len(list) -1]['x']
        yB = list[len(list) -1]['y']
        xA = list[0]['x']
        yA = list[0]['y']  


    x0 = list[0]['x']
    y0 = list[0]['y']

    # should calculate λ first
    # l = (yA - yB) / (xA - xB)
    # calculate angle
    radiants = math.atan2(yA - yB,xA - xB )
    angle = math.degrees(radiants)
    print(distance, distanceFromVelocity, len(list), len(template))

    x = distance * math.cos(angle)
    y = distance * math.sin(angle)

    x2 = distanceFromVelocity * math.cos(angle)
    y2 = distanceFromVelocity * math.sin(angle)

    x3 = totalDistance * math.cos(angle)
    y3 = totalDistance * math.sin(angle)

    endpoint = { 'simple_distance': [round(x+xB, 0), round(y+yB,0)], 'distance_from_velocity': [round(x2+xB, 0), round(y2+yB,0)], 'total_distance':[round(x3+x0, 0), round(y3+y0,0)] }
    return endpoint

if __name__ == '__main__':
    app.run(debug=True)