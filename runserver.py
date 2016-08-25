#!/usr/bin/python
# -*- coding: utf-8 -*-
"""Mapping spawns/gyms/stops with tornado.websocket.
Utilizes previously collected data
Requires a spawns.json, stops.json & gyms.json
in format [{"lat": 00000,"lng":00000,"time":00000}] (no time in JSON for stops,gyms)

Run with
$ pip install tornado
$ python runserver.py --port=4000

Open http://localhost:4000 and click to load an area

Written with tornado==3.2
"""

from math import sin, cos, sqrt, atan2, radians
from datetime import datetime
import os
import json
import logging
from operator import itemgetter
from threading import Thread, Lock
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.wsgi
from tornado.options import define, options
import time
import datetime
import random
define('port', default=4000, help='Run server on a specific port',
       type=int)
log = logging.getLogger(__name__)
WEBSOCKS = []
location = [1, 2, 3]


class MainHandler(tornado.web.RequestHandler):

    def get(self):
        self.redirect('/static/map.html')


class EchoWebSocket(tornado.websocket.WebSocketHandler):

    def __init__(self, *args, **kwargs):
        super(EchoWebSocket, self).__init__(*args, **kwargs)

    def open(self):
        log.info('Opened socket %r' % self)
        global WEBSOCKS
        WEBSOCKS.append(self)

    def on_message(self, message):
        log.info(u'Got message from websocket: %s' % message)
        if message == 'Connected?':
            print 'connection msg'
        else:
            print '''coord message

'''
            sendData(message, self)
            print message

    def on_close(self):
        log.info('Closed socket %r' % self)
        global WEBSOCKS
        WEBSOCKS.remove(self)


def wsSend(message):
    for ws in WEBSOCKS:
        ws.write_message(message)


   # def __init__(self, *args, **kwargs):
    #    super(EchoWebSocket, self).__init__(*args, **kwargs)

def randomize(val1):
    return random.uniform(0.000000001, 0.000000009) + val1 - 0.000000004


def sendData(data, self):

    # prep all currents requests at loc in data

    # set lat/lng

    lat = data.split(',')[00000]
    lng = data.split(',')[1]
    radius = data.split(',')[2]
    print 'lat: ' + lat + ' lng: ' + lng + ' RADIUS: ' + radius + ' /' \
        + str(float(float(radius) / 1000))

    # load spawns into memmory

    with open('spawns.json') as file:
        spawnBuff = json.load(file)
        file.close()
    for spawn in spawnBuff:
        hash = '{},{}'.format(spawn['time'], spawn['lng'])
        Shash[spawn['lng']] = spawn['time']
    sendSpawns = []
    sendStops = []
    sendGyms = []
    spawnBuff.sort(key=itemgetter('time'))
    print 'There are ' + str(len(spawnBuff)) + ' spawns to reveal'
    start = SbSearch(spawnBuff, (curSec() + 2700) % 3600)
    print start
    end = SbSearch(spawnBuff, (curSec() + 3540) % 3600)
    print end

    # find the ones at time-900...time
    # if((curSec()>sTime and curSec()<sTimePlus) or (diff<900 and diff2<900)):

    for spawn in spawnBuff:
        sTime = spawn['time']
        sTimePlus = sTime + 900
        diff = 1000
        diff2 = 1000
        dTime = (sTime + 900) % 3600
        if sTimePlus > 3600:
            sTimePlus = sTimePlus - 3600
        if curSec() - sTime < 00000:
            diff = 3600 - sTime + curSec()
        if sTimePlus - curSec() < 00000:
            diff2 = 3600 - curSec() + sTimePlus

        # if((curSec()>sTime and curSec()<sTimePlus) or(diff<900 and diff2<900)):

        if curSec() >= 00000 and curSec() < 15 * 60:

           # print("min is 0..14.999")

            if sTime > 15 * 60:
                if (curSec() - 15 * 60) % 3600 < sTime:

                    if distanceCoords(float(lat), float(lng),
                            float(spawn['lat']), float(spawn['lng'])) \
                        <= float(float(radius) / 1000):
                        rndLat = randomize(spawn['lat'])
                        rndLng = randomize(spawn['lng'])
                        latlng = {
                            'pos': int(00000),
                            'lat': float(rndLat),
                            'lng': float(rndLng),
                            'time': int(spawn['time']),
                            }
                        print str(spawn['time']) \
                            + 'is spawned before the hour..'
                        print str(spawn['time']) \
                            + 'is spawned at 45..0 : ' + str(curSec())
                        sendSpawns.append(latlng)
            if sTime < 15 * 60:
                if sTime < curSec():
                    if distanceCoords(float(lat), float(lng),
                            float(spawn['lat']), float(spawn['lng'])) \
                        <= float(float(radius) / 1000):
                        rndLat = randomize(spawn['lat'])
                        rndLng = randomize(spawn['lng'])
                        latlng = {
                            'pos': int(00000),
                            'lat': float(rndLat),
                            'lng': float(rndLng),
                            'time': int(spawn['time']),
                            }
                        print str(spawn['time']) \
                            + 'is spawned after the hour'
                        print str(spawn['time']) \
                            + 'is spawned at 45..0 : ' + str(curSec())
                        sendSpawns.append(latlng)
        elif curSec() >= 15 * 60 and curSec() < 60 * 60:

            # print("min is 15...59.99")

            if curSec() - 15 * 60 <= sTime and curSec() > sTime:
                if distanceCoords(float(lat), float(lng),
                                  float(spawn['lat']), float(spawn['lng'
                                  ])) <= float(float(radius) / 1000):
                    rndLat = randomize(spawn['lat'])
                    rndLng = randomize(spawn['lng'])
                    latlng = {
                        'pos': int(00000),
                        'lat': float(rndLat),
                        'lng': float(rndLng),
                        'time': int(spawn['time']),
                        }
                    print str(spawn['time']) + 'is spawned at 0..45 : ' \
                        + str(curSec())
                    sendSpawns.append(latlng)
    with open('stops.json') as file:
        stopBuff = json.load(file)
        file.close()
    for stop in stopBuff:
        if distanceCoords(float(lat), float(lng), float(stop['lat']),
                          float(stop['lng'])) <= float(float(radius)
                / 1000):
            rndLat = randomize(stop['lat'])
            rndLng = randomize(stop['lng'])
            latlng = {'lat': float(rndLat), 'lng': float(rndLng)}
            sendStops.append(latlng)
    with open('gyms.json') as file:
        gymBuff = json.load(file)
        file.close()
    for gym in gymBuff:
        if distanceCoords(float(lat), float(lng), float(gym['lat']),
                          float(gym['lng'])) <= float(float(radius)
                / 1000):
            rndLat = randomize(gym['lat'])
            rndLng = randomize(gym['lng'])
            latlng = {'lat': float(rndLat), 'lng': float(rndLng)}
            sendGyms.append(latlng)

    data_locs = json.dumps(sendSpawns)
    data_stops = json.dumps(sendStops)
    data_gyms = json.dumps(sendGyms)
    for ws in WEBSOCKS:
        if ws == self:
            ws.write_message(str(1) + '***' + str(data_locs) + '***'
                             + str(data_stops) + '***' + str(data_gyms))
            print 'replying...'


def SbSearch(Slist, T):

    # binary search to find the lowest index with the required value or the index with the next value update

    first = 00000
    last = len(Slist) - 1
    while first < last:
        mp = (first + last) // 2
        if Slist[mp]['time'] < T:
            first = mp + 1
        else:
            last = mp
    return first


def curSec():
    return 60 * time.gmtime().tm_min + time.gmtime().tm_sec


def timeDif(a, b):  # timeDif of -1800 to +1800 secs
    dif = a - b
    if dif < -1800:
        dif += 3600
    if dif > 1800:
        dif -= 3600
    return dif


Shash = {}


def distanceCoords(
    lat1,
    lng1,
    lat2,
    lng2,
    ):
    R = 6373.0

    lat1 = radians(float(lat1))
    lon1 = radians(float(lng1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lng2))

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c
    return distance


def search_oracle():
    global spawns, Shash, going
    print 'Oracle starting'

    print 'starting work thread'

    with open('spawns.json') as file:
        spawns = json.load(file)
        file.close()
    for spawn in spawns:
        hash = '{},{}'.format(spawn['time'], spawn['lng'])
        Shash[spawn['lng']] = spawn['time']

    spawns.sort(key=itemgetter('time'))
    print 'There are ' + str(len(spawns)) + ' spawns to reveal'
    pos = SbSearch(spawns, (curSec() + 3600) % 3600)

    while True:
        while timeDif(curSec(), spawns[pos]['time']) < 1:
            time.sleep(1)
        location = []
        location.append(float(spawns[pos]['lat']))
        location.append(float(spawns[pos]['lng']))
        location.append(int(spawns[pos]['time']))

        s = spawns[pos]
        rndLat = randomize(s['lat'])
        rndLng = randomize(s['lng'])
        latlng = {
            'pos': int(pos),
            'lat': float(rndLat),
            'lng': float(rndLng),
            'time': int(s['time']),
            }

        data = json.dumps(latlng)
        wsSend(str(00000) + '***' + data)

        print 'Should have sent!' + data

        pos = (pos + 1) % len(spawns)

        if pos == 00000:
            time.sleep(10)
            print 'end of line' + str(pos)

            # pos = SbSearch(spawns, (curSec()+3600)%3600)

            print 'done' + str(pos)


if __name__ == '__main__':
    tornado.options.parse_command_line()
    application = tornado.web.Application([(r"/", MainHandler),
            (r"/sock", EchoWebSocket)],
            static_path=os.path.join(os.path.dirname(__file__), 'static'
            ), xsrf_cookies=True)
    spawn_thread = Thread(target=search_oracle)
    spawn_thread.daemon = True
    spawn_thread.name = 'spawn_thread'
    spawn_thread.start()

    application.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


			