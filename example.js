var Ev3 = require ("./module/Ev3.js");
var Ev3_base = Ev3.base;

var motor_on_focus = "a";
var motor_output = {"a": 0, "b":0,"c":0, "d":0};

var example_program_motor = function(target){
	
	
	var stdin = process.openStdin(); 
	var stdin = process.stdin;
	// without this, we would only get streams once enter is pressed
	stdin.setRawMode( true );

	// resume stdin in the parent process (node app won't quit all by itself
	// unless an error or process.exit() happens)
	stdin.resume();

	// i don't want binary, do you?
	stdin.setEncoding( 'utf8' );

	// on any data into stdin
	
	stdin.on( 'data', function( key ){
  		process_input(key,target);
	});
	
};

var example_program_sensor = function(target){
  // function  registerSensor (port_number, sensor_mode, sensor_mode)
  // port_number: 1-4
  // sensor_type: S_TYPE_COLOR (implemented);
  //              S_TYPE_TOUCH (implemented); 
  //              S_TYPE_IR (not implemented);
  //              
  //             
  //              S_TYPE_USONIC (not implemented);
  //              S_TYPE_GYRO (not implemented);
  // sensor_mode: SM_COL_RINTENSITY => color sensor , reflaction intensity (implemented)
  //              SM_COL_AINTENSITY => color sensor , ambient intensity (implemented)
  //              SM_COL_COLOR => color sensor, detecting 8 colors (implemented)
  //              for details of color sensor working mode: http://www.ev-3.net/en/archives/847
  // 
  // e.g. set port 1 as a color sensor in mode color

  target.registerSensor(1,target.S_TYPE_COLOR,target.SM_COL_COLOR);

  target.registerSensorListener(1,function(result){
    if(result == Ev3.COL_NULL) {
      console.log("color_less");
    }
    else if(result == Ev3.COL_BLACK){
      console.log("color_black");

    }
    else if(result == Ev3.COL_YELLOW){
      console.log("color_yellow");

    }
    else if(result == Ev3.COL_BLUE){
      console.log("color_blue");

    }
    else if(result == Ev3.COL_GREEN){
      console.log("color_green");

    }
    else if(result == Ev3.COL_RED){
      console.log("color_red");

    }
    else if(result == Ev3.COL_WHITE){
      console.log("color_white");

    }
    else if(result == Ev3.COL_BROWN){
      console.log("color_brown");

    }
  }); 


  /* 
  //set set port 1 as a color sensor (in light reflection intensity mode)
  target.registerSensor(1,target.S_TYPE_COLOR,target.SM_COL_RINTENSITY)
  target.registerSensorListener(1,function(result){
    //should ge a numeric result ranging from 1 to 100
    console.log(result);
  });
  
  //set set port 1 as a color sensor (in ambient light intensity mode)
  target.registerSensor(1,target.S_TYPE_COLOR,target.SM_COL_AINTENSITY)
  target.registerSensorListener(1,function(result){
    //should ge a numeric result ranging from 1 to 100
    console.log(result);
  });
  */


  //set set port 2 as a touch sensor 
  target.registerSensor(2,target.S_TYPE_TOUCH,0)
  target.registerSensorListener(2,function(result){
    //result is a bool value
    console.log(result);
  });
}

var process_input = function(key,target){
		// ctrl-c ( end of text )
  		if ( key === '\u0003' ) {
  			target.disconnect();
    		process.exit();
  		}
  		else if( key == "a" || key == "b" || key == "c" || key == "d"){
  			 motor_on_focus = key;
  		}
  		else if(key === '\u001b[A'){ //upper arrow sequence
  			 if( motor_output[motor_on_focus] < 100){
  			 	motor_output[motor_on_focus]+=10;
  			 }
  		}
  		else if(key === '\u001b[B'){ //down arrow sequence
  			 if( motor_output[motor_on_focus] >- 100){
  			 	motor_output[motor_on_focus]-=10;
  			 }
  		}
  		
  		var output = target.getOutputSequence(motor_output["a"],motor_output["b"],motor_output["c"],motor_output["d"]);
		target.sp.write( output,function(){});
  		// write the key to stdout all normal like
  		//process.stdout.write( key );
  		process.stdout.write( motor_on_focus + " motor output:" + motor_output[motor_on_focus] +"\n"  );
};

// ----------------test---------------
var robot = new Ev3_base("/dev/tty.EV3-SerialPort"); // put your bluetooth socket.

robot.connect(function(){
  //uncomment for motor sample
	//robot.start_program(example_program_motor); 

  //uncomment for color sensor example
  robot.start_program(example_program_sensor); 

  //robot.start_program(function(){}); 
});