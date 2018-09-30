const express = require('express');
const redis = require('redis'),
  client = redis.createClient();
const cors = require('cors');

client.on('error', function(err) {
  console.log('Error ' + err);
});

const app = express();

app.use(cors());
app.use(express.static('static'));

app.get('/sensor/:sensor', function (req, res) {
  client.zrevrange(`${req.params.sensor}_keys`, 0, 1, (err, keys) => {
    if (!keys[0]) {
      res.send({
        'error': `Sensor ${req.params.sensor} not found`,
      });
    };

    client.hgetall(`${req.params.sensor}:${keys[0]}`, (err, obj) => {
      res.send({
        'sensor': req.params.sensor,
        'data': {
          'key': keys[0],
          'values': obj,
        },
      });
    });
  });
});

app.get('/sensor/:sensor/timeseries', function(req, res) {
  client.zrevrange(`${req.params.sensor}_keys`, 0, 1000, (err, keys) => {
    if (!keys[0]) {
      res.send({
        'error': `Sensor ${req.params.sensor} not found`,
      });
    };

    let timeseries = [];
    let batch = client.batch();
    keys.map((key) => {
      batch.hgetall(`${req.params.sensor}:${key}`, (err, obj) => {
        timeseries.push({
          'sensor': req.params.sensor,
          'data': {
            'key': keys[0],
            'values': obj,
          },
        });
      });
    });

    batch.exec((err, replies) => {
      res.send(timeseries);
    });
  });
});

app.listen(8080);
console.log('Running');
