# flowerpower2mqtt

Publish values from [Parrot Flower Power](http://www.parrot.com/usa/products/flower-power/) to MQTT

This project just connects [Sandeep Mistry's](https://github.com/sandeepmistry) [awesome Node module](https://github.com/sandeepmistry/node-flower-power) to MQTT - all credits belong to him.

## Getting started

You need [Node.js](https://nodejs.org). Since this depends on Noble you have to fulfill the prerequisites documented in the [Noble readme](https://github.com/sandeepmistry/noble). 
On apt based Linux a ```apt-get install bluetooth bluez-utils libbluetooth-dev libudev-dev``` should be enough.

Then install flowerpower2mqtt: ```npm install flowerpower2mqtt -g``` and take a look at the available command line options by typing ```flowerpower2mqtt --help```


## MQTT Topics & Payloads

Topic and payload structure follows [mqtt-smarthome](https://github.com/mqtt-smarthome) architecture. Default prefix is "flower".

* &lt;prefix&gt;/status/&lt;name&gt;/soilTemperature (°C)
* &lt;prefix&gt;/status/&lt;name&gt;/soilMoisture (%)
* &lt;prefix&gt;/status/&lt;name&gt;/soilElectricalConductivity (mS/cm)
* &lt;prefix&gt;/status/&lt;name&gt;/airTemperature (°C)
* &lt;prefix&gt;/status/&lt;name&gt;/sunlight 
* &lt;prefix&gt;/status/&lt;name&gt;/batteryLevel (%)
* &lt;prefix&gt;/status/&lt;name&gt;/led 
* &lt;prefix&gt;/set/&lt;name&gt;/led - If you publish a message to this topic the LED will start fading for given number of seconds. Accepts plain and JSON payload.


## Todo

* connection handling - keep connection alive for configurable timeout
* support for activating live mode
* support fw 1.1 - calibrated values

## License

Copyright (c) 2015 Sebastian Raff <hq@ccu.io> (https://github.com/hobbyquaker)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.