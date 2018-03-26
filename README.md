# Readme File 

Download the file and run 

		npm install
		
to install the modules of the node

This is the project related to the drone monitoring system.
The following repository consists of both client and server side.

### Server Side
(found in server/server.js)

Server side is designed with the nodejs(node version 9.6.1) platfrom with the use of socket.io on both side.
The Server Side consists of different node module packages. They are listed below.

1. [express](http://expressjs.com/) (v4.16.3) 
2. [socket.io](https://socket.io/) (v2.0.4)
3. path 
4. http

The express creates the application at location '/data' which takes get request and the received data is emitted to the socket at the client.
Express also creates the middleware at public directory.

Data are send to '/data' in following manner

http://example.com/data?lat=123&long=123&......

The get parameters are

* conn - Connection Status
* arm - Copter Armed Status
* ekf - EKF error is present or not
* mode - In which mode the copter is working
* lat - latitude provide by the copter
* long - longitude provide by the copter
* alt - altitude provide by the copter
* head - magnetometer heading
* lidar - height provide by the lidar
* gs - ground speed of the copter
* air - air speed of the copter
* status - if the error is present or not
* altr - relative altitude 
* volt - voltage of the battery
* numSat - number of satellite connected
* hdop - horizontal diluton of precision of the copter
* fix - weather the 2D fix is present or 3D fix is present or neither


the update of the value can be seen in the main page.

http://example.com

- html file at (public/index.html)
- js file at 

		public/js/index.js
		public/js/libs/*
		
- css file at public/css/*
