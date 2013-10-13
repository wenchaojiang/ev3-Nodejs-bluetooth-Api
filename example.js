var Ev3 = require ("./module/Ev3.js");
var Ev3_base = Ev3.base;

// ----------------test---------------
var robot = new Ev3_base("/dev/tty.EV3-SerialPort"); // put your bluetooth socket.


var motor_on_focus = "a";
var motor_output = {"a": 0, "b":0,"c":0, "d":0};

var readKeyStroke = function(target){
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
  		process.stdout.write( motor_on_focus + ":" + motor_output[motor_on_focus] +"\n"  );
};

robot.connect(function(){
		robot.start_program(readKeyStroke); 
});
