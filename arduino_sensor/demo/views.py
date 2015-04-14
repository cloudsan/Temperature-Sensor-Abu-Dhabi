from django.shortcuts import render
from demo.models import Arduino_data, Setting
from django.http import HttpResponse
# Create your views here.
from urllib.request import urlopen
import urllib.error
import csv
import io
import time
import datetime


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
