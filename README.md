# Drone Monitoring System

Drone Monitoring System is a nodejs based system. As the name suggest it is used for monitoring the position and status of the drone in Real Time using a protocol called websocket (i.e. socket.io). It consists of both server side and frontend side programs which relays data from the [drone](https://github.com/prokuranepal/dronekit_delivery) to the [mobile]() based system and also store the data in the database (i.e. Mongodb). It's frontend side also listen to the server for the data to display the positions in the website. However the android and web based frontend differs from each other by some functionalities. 

| Android | Web Based |
| :--------: | :-------------: |
| view motion of drone. | view motion of drone. |
| control the actions of drone. | download the flight data.|
| replay the previous flight data. | add planes to the system and mange users. |

## Installation and Running

#### Requirements

- npm
- nodejs
- mongodb

To install and run the package.

 1. Clone the [project](https://github.com/prokuranepal/Drone-Monitoring-server.git)
 
 2. Move towards the directory of the cloned project.
 
 3. Install the package using package manager npm.
 
	 ```
	$ npm install
	```

4. Start the project using.
	
	```
	$ npm start
	```

5. Now the project will be running in http://localhost:3000

## How to use (Frontend)

STEP-1

    At first a user should be created. If the user is already created than you can skip this step.

    To create the user you should go to the link (localhost:3000/create_user) which displays the following page.
    
    If this is the first time creating user you need to goto database and change the field "is_valid" and "is_admin" to true.

![Signuppage](/image/Signuppage.png)

    In which you should fill the requested data as seen in the above figure.

    Example
    - Full Name : John Doe
    - Username : john.doe
    - E-Mail : johndoe@gmail.com
    - Password : johndoe
    - Confirm Password : johndoe

    In the above example username and password is used for login in to the requested pages.

    The given password will be saved in the hash and salt format rather than plain text.

    After the user has been created the user will be reviewed and validate by the admin user to provide access for login in into the drone viewable page.(validation is done by the admin user.)

STEP-2

    If the username and password is validated by the admin user then the user can login into the drone monitoring page. To login you must goto the page.

![loginpage](/image/loginpage.png)

    In which you should fill the requested data as seen in the above figure.

    Example:
    - Username : john.doe
    - Password : johndoe
    - Location : JT601,pulchowk

    In the above example username and password are your login credientials. and the location is the field which describes the drone you want to view.

    Location consists of all the drone available in the system. You can choose to view the available drone.
    
    You can also view all drone status by selecting all in the location field.
    
    To view the drone status you must login and you will be take to the next page.

STEP-3

    After login into the system you will be taken to the respective drone page from where you can view the status of the drone. The page looks like below.

![Monitoring System](/image/monitoringsystem1.png)

    As you can see position of drone in the map indicated by the arrow.

    In which red arrow means the drone is offline and green arrow means the drone is online.

    As in the above picture you can see different buttons which are:

    - Show
    By clicking the show button you can view different datas of the drone as shown in the figure below.

![Drone Data](/image/dronedata.png)

    - Read Mission
    By clicking the read mission button you can download the mission file present in the drone and is displayed in the map.

![Read Mission](/image/dronemission.png)

    - Download File
    By clicking the download file button you will be redirected to the new page where you can view all the logs and by clicking them you can download to the local machine.

![Download File](/image/dronelogs.png)

    - Clear Display
    By clicking the clear display button, the screen will be cleared.

    - Draw Circle
    By clicking the draw circle button you will be able to draw 10 adjacent circle with radius provide by the user.

![Draw Circle](/image/drawcircle.png)

