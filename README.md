# flowerpower2mqtt

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg)](https://github.com/mqtt-smarthome/mqtt-smarthome)

> Publish values from [Parrot Flower Power](http://www.parrot.com/usa/products/flower-power/) to MQTT

This project just connects [Sandeep Mistry's](https://github.com/sandeepmistry) [awesome Node module](https://github.com/sandeepmistry/node-flower-power) to MQTT - all credits belong to him.

## Getting started

You need [Node.js](https://nodejs.org). Since this depends on Noble you have to fulfill the prerequisites documented in the [Noble readme](https://github.com/sandeepmistry/noble). 
On apt based Linux a ```sudo apt-get install bluetooth bluez-utils libbluetooth-dev libudev-dev``` should be enough.

Then install flowerpower2mqtt: ```sudo npm install flowerpower2mqtt -g``` and take a look at the available command line options by typing ```flowerpower2mqtt --help```


## MQTT Topics & Payloads

Topic and payload structure follows [mqtt-smarthome](https://github.com/mqtt-smarthome) architecture. Default prefix is "flower".

#### These topics are published in a configurable interval with retain flag set to true
* &lt;prefix&gt;/status/&lt;device&gt;/soilTemperature (°C)
* &lt;prefix&gt;/status/&lt;device&gt;/soilMoisture (%)
* &lt;prefix&gt;/status/&lt;device&gt;/soilElectricalConductivity (mS/cm)
* &lt;prefix&gt;/status/&lt;device&gt;/airTemperature (°C)
* &lt;prefix&gt;/status/&lt;device&gt;/sunlight 
* &lt;prefix&gt;/status/&lt;device&gt;/batteryLevel (%)
* &lt;prefix&gt;/status/&lt;device&gt;/led 

#### These topics are subscribed. You should publish to them with retain flag set to false
* &lt;prefix&gt;/set/&lt;device&gt;/led - If you publish a message to this topic the LED will start fading up and down for given number of seconds. Accepts plain and JSON payload.


## Todo

* connection handling - keep connection alive for configurable timeout
* enable/disable live mode
* fw 1.1 support - calibrated values

## License

Copyright (c) 2015 Sebastian Raff <hq@ccu.io> (https://github.com/hobbyquaker)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
