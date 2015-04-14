
import time
import datetime
from urllib.request import urlopen
import urllib.error
import csv
import io


def provideData(request):
    lasttimestr = "2015/02/19 00:00:00"
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
            print(timestr)
            for row in cr:
                print(row)
            d += delta
        except urllib.error.HTTPError as err:

            if err.code == 404:
                d += delta
                continue
            else:
                raise

    # return HttpResponse(s)
    return s

provideData(None)
