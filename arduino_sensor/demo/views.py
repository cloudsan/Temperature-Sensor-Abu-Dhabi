from django.shortcuts import render
from demo.models import Arduino_data, Setting, nodeData
from django.http import HttpResponse, JsonResponse
# Create your views here.
from urllib.request import urlopen
import urllib.error
import csv
import io
import time
import datetime
from urllib.parse import urlparse
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings


# def getJsonTest(request):
#     t = '''{"result":[{"datetime":"2014/01/01","temp":24,"humidity":30},
# {"datetime":"2014/01/02","temp":24,"humidity":44},
# {"datetime":"2014/01/03","temp":22,"humidity":30},
# {"datetime":"2014/01/04","temp":21,"humidity":55},
# {"datetime":"2014/01/05","temp":20,"humidity":35},
# {"datetime":"2014/01/06","temp":23,"humidity":32},
# {"datetime":"2014/01/07","temp":22,"humidity":35},
# {"datetime":"2014/01/08","temp":25,"humidity":69},
# {"datetime":"2014/01/09","temp":27,"humidity":30},
# {"datetime":"2014/01/10","temp":30,"humidity":72},
# {"datetime":"2014/01/11","temp":23,"humidity":30}]}'''
#     response = HttpResponse(t)
#     response['access-control-allow-origin'] = '*'
#     return response


def getJsonTest(request):
    data = nodeData.objects.raw(
        'select * from (select node_id,max(dt) as maxdt from demo_nodedata group by node_id) x join demo_nodedata d on d.node_id ==x.node_id and d.dt = x.maxdt;')
    result = {}
    result.setdefault("list", [])
    for item in data:
        k = {}
        k['id'] = item.id
        k['node_id'] = item.node_id
        k['t1'] = item.t1
        k['t2'] = item.t2
        k['h1'] = item.h1
        k['h2'] = item.h2
        k['lng'] = item.lng
        k['lat'] = item.lat
        k['dt'] = item.dt.strftime('%Y/%m/%d %H:%M')
        result["list"].append(k)
    # result = getUnsolvedHigher(0)
    response = JsonResponse(result, status=200)
    response['access-control-allow-origin'] = '*'
    return response


@csrf_exempt
def postData(request):
    id = request.GET.get('id')
    t1 = request.GET.get('t1')
    t2 = request.GET.get('t2')
    h1 = request.GET.get('h1')
    h2 = request.GET.get('h2')
    lng = request.GET.get('long')
    lng = float('54.' + lng)
    lat = request.GET.get('lati')
    lat = float('24.' + lat)
    dtstr = request.GET.get('dt')
    dt = time.strptime(dtstr, '%Y/%m/%d,%H:%M')
    dtstr = time.strftime('%Y-%m-%d %H:%M', dt)
    newOne = nodeData(
        node_id=id, t1=t1, h1=h1, lng=lng, lat=lat, dt=dtstr, t2=t2, h2=h2)
    newOne.save()
    return JsonResponse(newOne.getDict())


def getData(request, id):
    # data = nodeData.objects.filter(
    #     userID_id=id).order_by('-created_at')[:10]
    data = nodeData.objects.filter(node_id=id).order_by('dt')
    result = {}
    result.setdefault("list", [])
    for item in data:
        k = {}
        k['id'] = item.id
        k['node_id'] = item.node_id
        k['t1'] = item.t1
        k['t2'] = item.t2
        k['h1'] = item.h1
        k['h2'] = item.h2
        k['lng'] = item.lng
        k['lat'] = item.lat
        k['dt'] = item.dt.strftime('%Y/%m/%d %H:%M')
        result["list"].append(k)
    # result = getUnsolvedHigher(0)
    response = JsonResponse(result, status=200)
    response['access-control-allow-origin'] = '*'
    return response


def historical(request, id):
    return render(request, 'demo_history.html')


def mapview(request):
    return render(request, 'map.html')


def bootstrap(request):
    return render(request, 'mapbootstrap.html')


def provideData(request):
    if Setting.objects.filter(name='LastUpdateTime').exists():
        lasttimestr = Setting.objects.get(name='LastUpdateTime')
    else:
        lasttimestr = "2015/02/19 00:00:00"
    if Setting.objects.filter(name='Url').exists():
        url = Setting.objects.get(name='Url')
    else:
        url = "http://systemdev.org/sensordata/"
    lasttime = time.strptime(lasttimestr, '%Y/%m/%d %H:%M:%S')

    s = ''
    d = datetime.datetime.fromtimestamp(time.mktime(lasttime))
    delta = datetime.timedelta(days=1)
    while d <= datetime.datetime.now():
        try:
            timestr = d.strftime('%m-%d-%Y')
            response = urlopen(url + timestr + '.csv')
            cr = csv.reader(io.TextIOWrapper(response))
            s = ''
            for row in cr:
                s = s + str(row) + '<br>'
            d += delta
        except urllib.error.HTTPError as err:

            if err.code == 404:
                d += delta
                continue
            else:
                return HttpResponse(err.code)

    # return HttpResponse(s)
    return HttpResponse(s)
