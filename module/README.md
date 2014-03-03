Ev3NodeJsBtAPI
==============

Control your Lego Ev3 robot without hacking into intelligent brick (over bluetooth).
A nodejs alternative to monobrick http://www.monobrick.dk/

!!!!!!tested on firmware V1.01H!!!!!!!!!

Change log
==============
Exisiting !!!. Implemented Color sensor. For more details, run and read example.js (3 Mar 2014)
Nice !!!, Color sensor can now work in other 2 different modes (light reflection intensity, ambient light intensity) (3 Mar 2014) 

motivation 
==============
1. You may not like graphic programming interface provided by official labview software (you know it is for kids :p).
2. You may not want to heck into intelligent brick (if you do, check out the alternatives: http://www.lejos.org/).
3. You are a nodejs fan.

If 1 2 3 are true for you, this module is the one for you. 
The module provide an node js api for controlling Lego Ev3 robot over bluetooth. 
You can write your robot control program in nodejs, run it on any bluetooth enabled pc/laptop, control your Ev3 robot remotely.

Usage
==============
1. go into "module" 
2. run "npm install"
3. pair your laptop/pc with intelligent brick
troubleshoot: http://www.ev-3.net/en/archives/97
4. run example.js: "node example.js"
5. see "example.js" for more details

Example.js
==============
./example.js  provide an interacive terminal interface for controlling motors.

press a, b, c or d to switch control among motors.

press up or down arrow to control motor output. 

a demo available at : http://www.youtube.com/watch?v=HHfj1cx_dlw

press ctrl-C to quit.


Please Help
===============
This module is built by reverse engineering the bluetooch communication between offical android Lego app and Ev3 robot.
Currently I only deciphered the control protocol for motors, not sensors. If you have any information on the protocol, please help.

New to nodejs and async world, please feel free to refector my code.

You can help on testing on various Ev3 firmwares.
