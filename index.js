#!/usr/bin/env node

var async = require('async');

var FlowerPower = require('flower-power');

var pkg = require('./package.json');
var config = require('./config.js');
var log = require('yalm');
log.setLevel(config.v);

log.info(pkg.name + ' ' + pkg.version + ' starting');
var dev = {};
var mapIdName = {};
var mapNameId = {};
var data = {};

/*
 MQTT
 */
var Mqtt = require('mqtt');

if (typeof config.topic !== 'string') config.topic = '';
if (config.topic !== '' && !config.topic.match(/\/$/)) config.topic = config.topic + '/';

var mqttConnected;


log.info('mqtt trying to connect', config.url);
var mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0'}});

mqtt.on('connect', function () {
    mqttConnected = true;
    log.info('mqtt connected ' + config.url);
    mqtt.publish(config.name + '/connected', '2');
    log.info('mqtt subscribe', config.name + '/set/#');
    mqtt.subscribe(config.name + '/set/#');
});

mqtt.on('close', function () {
    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt closed ' + config.url);
    }
});

mqtt.on('error', function () {
    log.error('mqtt error ' + config.url);
});

mqtt.on('message', function (topic, payload) {
    payload = payload.toString();
    log.debug('mqtt <', topic, payload);

    var tmp = topic.split('/');

    if (!mapNameId[tmp[2]]) {
        log.error(topic, 'unknown device', tmp[2]);
        return;
    }

    var state;
    if (tmp[1] === 'set') {
        switch (tmp[3]) {
            case 'led':

                try {
                    state = JSON.parse(payload).val;
                    if (typeof state === 'undefined') state = payload;
                } catch (e) {
                    state = payload;
                }

                state = parseFloat(state) || 1;
                led(mapNameId[tmp[2]], state);
                break;
            default:
                log.error(topic, 'unknown datapoint', tmp[1]);
                return;

        }
    } else if (tmp[2] === 'get') {
        log.error('get not yet implemented');
    }



});



function publish(id, dp, val) {
    switch (dp) {
        case 'soilMoisture':
        case 'airTemperature':
        case 'soilTemperature':
            val = Math.round(parseFloat(val) * 10) / 10;
            break;
        case 'sunlight':
            val = Math.round(parseFloat(val) * 1000) / 1000;
            break;
        default:

    }

    if (!data[id]) data[id] = {};
    if (data[id][dp] !== val) {
        data[id][dp] = val;
        var topic = [config.n, 'status', mapIdName[id], dp].join('/');
        var payload = JSON.stringify({val: val, ts: new Date().getTime(), bt_mac: dev[id].address});
        var options = {retain: true};
        log.debug('mqtt >', topic, payload, options);
        mqtt.publish(topic, payload, options);
    }
}

/*
        Flower Power
 */




function led(id, length) {
    var flowerPower = dev[id];
    var cmds = [
        function (callback) {
            log.debug(flowerPower.id, 'connectAndSetup');
            flowerPower.connectAndSetup(callback);
        },
        function (callback){
            log.debug(flowerPower.id, '> ledPulse');
            flowerPower.ledPulse(function (err) {
                if (!err) publish(id, 'led', 1);
                setTimeout(callback, length * 1000);
            });
        },
        function (callback) {
            log.debug(flowerPower.id, '> ledOff');
            flowerPower.ledOff(function (err) {
                if (!err) publish(id, 'led', 0);
                callback();
            });
        },
        function (callback) {
            log.debug(flowerPower.id, '> disconnect');
            flowerPower.disconnect(callback);
        }

    ];
    async.series(cmds);
}



function pollData(id) {
    var flowerPower = dev[id];
    async.series([
        function (callback) {

            log.debug(flowerPower.id, 'connectAndSetup');
            flowerPower.connectAndSetup(function (err) {
                if (err) log.error(flowerPower.id, err);
                callback(err);
            });
        },

        function (callback){
            log.debug(flowerPower.id, '> readFriendlyName');
            flowerPower.readFriendlyName(function (err, friendlyName) {
                friendlyName = friendlyName.replace(/\0/g, '');
                log.debug(flowerPower.id, '< readFriendlyName', err, JSON.stringify(friendlyName));

                mapNameId[friendlyName] = flowerPower.id;
                mapIdName[flowerPower.id] = friendlyName;
                callback();
            });
        },


            /*
        function (callback){
            log.debug(flowerPower.id, '> discoverServicesAndCharacteristics');
            flowerPower.discoverServicesAndCharacteristics(callback);
        },
        function (callback){
            log.debug(flowerPower.id, '> readSystemId');
            flowerPower.readSystemId(function (err, systemId) {
                log.debug(flowerPower.id, '< readSystemId', err, systemId);
                callback();
            });
        },
        function (callback){
            log.debug(flowerPower.id, '> readSerialNumber');
            flowerPower.readSerialNumber(function (err, serialNumber) {
                log.debug(flowerPower.id, '< readSerialNumber', err, serialNumber);
                callback();
            });
        },
        function (callback){
            log.debug(flowerPower.id, '> readFirmwareRevision');
            flowerPower.readFirmwareRevision(function (err, firmwareRevision) {
                log.debug(flowerPower.id, '< readFirmwareRevision', err, firmwareRevision);
                callback();
            });
        },
        function (callback){
            log.debug(flowerPower.id, '> readHardwareRevision');
            flowerPower.readHardwareRevision(function (err, hardwareRevision) {
                log.debug(flowerPower.id, '< readHardwareRevision', err, hardwareRevision);
                callback();
            });
        },*/
        function (callback) {
            log.debug(flowerPower.id, '> readBatteryLevel');
            flowerPower.readBatteryLevel(function (err, batteryLevel) {
                log.debug(flowerPower.id, '< readBatteryLevel', err, batteryLevel);
                if (!err) publish(flowerPower.id, 'batteryLevel', batteryLevel);
                callback();
            });
        },
        /*

        function (callback){
            log.debug(flowerPower.id, '> readColor');
            flowerPower.readColor(function (err, color) {
                log.debug(flowerPower.id, '< readColor', err, color);

                callback();
            });
        },*/
        function (callback) {
            log.debug(flowerPower.id, '> readSunlight');
            flowerPower.readSunlight(function (err, sunlight) {
                log.debug(flowerPower.id, '< readSunlight', err, sunlight);
                if (!err) publish(flowerPower.id, 'sunlight', sunlight);
                callback();
            });
        },
        function (callback) {
            log.debug(flowerPower.id, '> readSoilElectricalConductivity');
            flowerPower.readSoilElectricalConductivity(function (err, soilElectricalConductivity) {
                log.debug(flowerPower.id, '< readSoilElectricalConductivity', soilElectricalConductivity);
                if (!err) publish(flowerPower.id, 'soilElectricalConductivity', soilElectricalConductivity);
                callback();
            });
        },
        function (callback) {
            log.debug(flowerPower.id, '> readSoilTemperature');
            flowerPower.readSoilTemperature(function (err, temperature) {
                log.debug(flowerPower.id, '< readSoilTemperature', temperature);
                if (!err) publish(flowerPower.id, 'soilTemperature', temperature);
                callback();
            });
        },
        function (callback) {
            log.debug(flowerPower.id, '> readAirTemperature');
            flowerPower.readAirTemperature(function (err, temperature) {
                log.debug(flowerPower.id, '< readAirTemperature', temperature);
                if (!err) publish(flowerPower.id, 'airTemperature', temperature);
                callback();
            });
        },
        function (callback) {
            log.debug(flowerPower.id, 'readSoilMoisture');
            flowerPower.readSoilMoisture(function (err, soilMoisture) {
                log.debug(flowerPower.id, 'readSoilMoisture', soilMoisture);
                if (!err) publish(flowerPower.id, 'soilMoisture', soilMoisture);
                callback();
            });
        },
/*
        function (callback){
            log.debug(flowerPower.id, 'enableLiveMode');
            flowerPower.enableLiveMode(callback);
        },
        function (callback){
            log.debug(flowerPower.id, 'live mode');
            setTimeout(callback, 5000);
        },
        function (callback){
            log.debug(flowerPower.id, 'disableLiveMode');
            flowerPower.disableLiveMode(callback);
        },
        function (callback){
            log.debug(flowerPower.id, 'ledPulse');
            flowerPower.ledPulse(callback);
        },
        function (callback){
            log.debug(flowerPower.id, 'delay');
            setTimeout(callback, 2000);
        },
        function (callback){
            log.debug(flowerPower.id, 'ledOff');
            flowerPower.ledOff(callback);
        },
        */
        function (callback){
            log.debug(flowerPower.id, '> disconnect');
            flowerPower.disconnect(callback);
        }
    ]);
}

function discover(callback) {

    var onDiscover = function (flowerPower) {
        log.debug('< discoverAll', flowerPower.address, flowerPower.name);

        dev[flowerPower.id] = flowerPower;

        flowerPower.on('disconnect', function() {
            log.debug(flowerPower.id, 'disconnected');
        });

        flowerPower.on('sunlightChange', function (sunlight) {
            log.debug(flowerPower.id, '< sunlightChange', sunlight);
            if (!err) publish(flowerPower.id, 'sunlight', sunlight);
        });

        flowerPower.on('soilElectricalConductivityChange', function (soilElectricalConductivity) {
            log.debug(flowerPower.id, '< soilElectricalConductivityChange', soilElectricalConductivity);
            if (!err) publish(flowerPower.id, 'soilElectricalConductivity', soilElectricalConductivity);
        });

        flowerPower.on('soilTemperatureChange', function (temperature) {
            log.debug(flowerPower.id, '< soilTemperatureChange', temperature);
            if (!err) publish(flowerPower.id, 'soilTemperature', temperature);
        });

        flowerPower.on('airTemperatureChange', function (temperature) {
            log.debug(flowerPower.id, '< airTemperatureChange', temperature);
            if (!err) publish(flowerPower.id, 'airTemperature', temperature);
        });

        flowerPower.on('soilMoistureChange', function (soilMoisture) {
            log.debug(flowerPower.id, '< soilMoistureChange', soilMoisture);
            if (!err) publish(flowerPower.id, 'soilMoisture', soilMoisture);
        });

        pollData(flowerPower.id);

    };
    log.debug('> FlowerPower.discoverAll');
    FlowerPower.discoverAll(onDiscover);

    setTimeout(function (callback) {
        log.debug('FlowerPower.stopDiscoverAll');
        FlowerPower.stopDiscoverAll(onDiscover);
        if (typeof callback === 'function') callback();
    }, 60000);


}

discover();

setInterval(function () {
    for (var id in dev) {
        pollData(id);
    }
}, config.i * 60 * 1000);




/*
 stop process
 */
function stop(signal) {
    log.info('got ' + signal + ' - terminating.');


    try {
        mqtt.end(function () {
            log.debug('mqtt disconncted');
            process.exit(0);
        });
    } catch (e) {}


    setTimeout(function () {
        process.exit(0);
    }, 200);
}

process.on('SIGINT', function () {
    stop('SIGINT');
});
process.on('SIGTERM', function () {
    stop('SIGTERM');
});
