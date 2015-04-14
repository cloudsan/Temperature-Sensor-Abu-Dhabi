from django.db import models

# Create your models here.


class Setting(models.Model):
    name = models.CharField(max_length=100)
    data = models.CharField(max_length=100)

    def __str__(self):
        return self.name + ':' + self.data


class Arduino_data(models.Model):
    node_id = models.CharField(max_length=5)
    sensor_id = models.CharField(max_length=5)
    create_time = models.DateTimeField()
    data_type = models.CharField(max_length=5)
    data = models.CharField(max_length=15)


class nodeData(models.Model):
    node_id = models.IntegerField()
    t1 = models.FloatField(default=0)
    t2 = models.FloatField(default=0)
    h1 = models.FloatField(default=0)
    h2 = models.FloatField(default=0)
    lng = models.FloatField(default=0)
    lat = models.FloatField(default=0)
    dt = models.DateTimeField()

    def getDict(self):
        result = {}
        result['id'] = self.id
        result['t1'] = self.t1
        result['t2'] = self.t2
        result['h1'] = self.h1
        result['h2'] = self.h2
        result['lng'] = self.lng
        result['lat'] = self.lat
        result['dt'] = self.dt
        return result
