var SP = require("serialport");
var SerialPort = SP.SerialPort;
var util = require('util');

var Sensor = function(port,type,mode){
	var port = port;
	var type = type;
	this.mode = mode;
	this.callbacks = [];
	var pull_command =  null; 
	this.request_counter = -1;

	this.pushCallback = function(callback){
		this.callbacks.push(callback);
	};

	this.pullReading = function(counter,sp){
		this.request_counter = counter;
		//construct buffer
		pull_command = new Buffer("0B00"+counter+"0001009A000"+ (port-1) + type +"0"+ mode +"60","hex");
		//console.log(pull_command.toString("hex"));
		sp.write(pull_command);
	}

}



Sensor.prototype.processData = function(counter){
	if(counter != this.request_counter){
		return
	}
}


//inherited sensors
var ColorSensor = function(port,type,mode){
	//paratistic inheritance
	//http://www.crockford.com/javascript/inheritance.html
	var sensor = new Sensor(port,type,mode);
	sensor.processData =function(counter,value){
		if(counter != this.request_counter){
			return
		}
		var payload = value.substr(10,2);

		//if mode is light intensity, change the result to numeric value
		if(this.mode == 0 || this.mode ==1 ){
			payload = parseInt(payload,16);
		}

		for(i=0; i < this.callbacks.length ; i++){
			this.callbacks[i](payload);
		}
	}

	return sensor;
}

var TouchSensor = function(port,type,mode){
	//paratistic inheritance
	//http://www.crockford.com/javascript/inheritance.html
	var sensor = new Sensor(port,type,mode);
	sensor.processData = function(counter,value){
		if(counter != this.request_counter){
			return
		}

		var payload = value.substr(10,2);
		var result = false;
		if(payload == "00") { result = false; } else if(payload == "64") { result=true; }
		for(i=0; i < this.callbacks.length ; i++){
			this.callbacks[i](result);
		}
	}

	return sensor;
}

module.exports.COL_NULL = "00";
module.exports.COL_BLACK = "0c";
module.exports.COL_BLUE = "19";
module.exports.COL_GREEN = "25";
module.exports.COL_YELLOW = "32";
module.exports.COL_RED = "3e";
module.exports.COL_WHITE = "4b";
module.exports.COL_BROWN = "57";

//---------------base class-----------------
var Ev3_base = function(btport){

	//All sequence read from reverse engineering 
	this.INIT_SEQ =new Buffer([0x07,0x00,0x00,0x00,0x80,0x00,0x00,0x02,0x01]);
	this.INIT_DOWNLOAD_SEQ = new Buffer("2500010001920F0100002F6D6E742F72616D6469736B2F70726A732F6D6F62696C652E72626600", "hex"); 
	
	
	this.PROGRAM_SEQ = new Buffer("B10002000193004C45474FAC0000006500020002000000280000000000000008000000AB0000000000000000000000841200841300820000820000841C01820000820000842E2E2F617070732F427269636B2050726F6772616D2F4F6E427269636B496D6167653132008400821B08300060858332000000403482020046646046821300348202004768604782080031604430006005444161820B00A5000161A6000140820400A300010086404082C1FF0A0A", "hex"); 
	this.STOP_DOWNLOAD_SEQ = new Buffer("0600030001980000", "hex"); 

	//single motor
	//this.RUN_PROGRAM_SEQ = new Buffer("2D000400800020C00801842F6D6E742F72616D6469736B2F70726A732F6D6F62696C652E7262660040440301404440", "hex" ); 
	//this.PROGRAM_SEQ = new Buffer("B10002000193004C45474FAC0000006500020002000000280000000000000008000000AB0000000000000000000000841200841300820000820000841C01820000820000842E2E2F617070732F427269636B2050726F6772616D2F4F6E427269636B496D6167653132008400821B08300060858332000000403482020046646046821300348202004768604782080031604430006005444161820B00A5000161A6000140820400A300010086404082C1FF0A0A", "hex"); 
	
	//multi - motor
	//this.RUN_PROGRAM_SEQ = new Buffer("2D000400800020C00801842F6D6E742F72616D6469736B2F70726A732F6D6F62696C652E7262660040440301404440", "hex" ); 
	//this.PROGRAM_SEQ = new Buffer("140102000193004C45474F0F01000065000500050000004C00000000000000080000000B01000000000000000000000C01000000000000000000000D01000000000000000000000E0100000000000000000000841200841300820000820000841C01820000820000842E2E2F617070732F427269636B2050726F6772616D2F4F6E427269636B496D6167653132008400821B08300060858332000000403482020046646046821300348205004768604782080031604430006005444161820B00A5000161A6000140820400A30001004162820B00A5000262A6000240820400A30002004163820B00A5000463A6000440820400A30004004164820B00A5000864A6000840820400A30008008640408285FF0A0A0A0A0A", "hex"); 

	//multi - motor - single touch sensor
	this.RUN_PROGRAM_SEQ = new Buffer("2D000400800020C00801842F6D6E742F72616D6469736B2F70726A732F6D6F62696C652E7262660040440301404440", "hex" ); 
	this.PROGRAM_SEQ = new Buffer("140102000193004C45474F0F01000065000500050000004C00000000000000080000000B01000000000000000000000C01000000000000000000000D01000000000000000000000E0100000000000000000000841200841300820000820000841C01820000820000842E2E2F617070732F427269636B2050726F6772616D2F4F6E427269636B496D6167653132008400821B08300060858332000000403482020046646046821300348205004768604782080031604430006005444161820B00A5000161A6000140820400A30001004162820B00A5000262A6000240820400A30002004163820B00A5000463A6000440820400A30004004164820B00A5000864A6000840820400A30008008640408285FF0A0A0A0A0A", "hex"); 



	this.OUTPUT_HEADER_SEQ = "000004"; 
	this.OUTPUT_DELIMITER_SEQ = "30";
	this.OUTPUT_BODY_SEQ = "407E018200008"; 
	this.TERMINATE_SEQ = new Buffer("070055008000000201","hex");

	this.sp = new SerialPort("/dev/tty.EV3-SerialPort", {
		  parser: SP.parsers.raw
	}, false); 

	this.getOutputSequence = function(a,b,c,d){
		//modify header
		var header = this.OUTPUT_HEADER_SEQ; 

		var body_a =  "";
		if(a != null) body_a = this.OUTPUT_DELIMITER_SEQ + this.getHexOutput(a) + this.OUTPUT_BODY_SEQ + "301000000830100000040";

		var body_b =  "";
		if(b != null) body_b = this.OUTPUT_DELIMITER_SEQ + this.getHexOutput(b) + this.OUTPUT_BODY_SEQ + "302000000830200000040";

		var body_c =  "";
		if(c != null) body_c = this.OUTPUT_DELIMITER_SEQ + this.getHexOutput(c) + this.OUTPUT_BODY_SEQ + "303000000830300000040";

		var body_d =  "";
		if(d != null) body_d = this.OUTPUT_DELIMITER_SEQ + this.getHexOutput(d) + this.OUTPUT_BODY_SEQ + "304000000830400000040";

		//get counter
		var size = ((this.getCounter()+header+body_a+body_b+body_c+body_d).length/2).toString(16); //check this 
		var prefix = size + "00" + this.getCounter() + header ;
		var body = prefix + body_a + body_b + body_c + body_d; 
		//console.log(body.toUpperCase());
		return  new Buffer( body.toUpperCase(), "hex");
	};
	var counter = 0;
	this.getCounter = function(){
		var cstring = counter.toString(16);
		if(cstring.length ==  1){
			cstring = "000"+ cstring ;
			//console.log(cstring);
		} else if (cstring.length ==  2){
			cstring = "00" + cstring;
		} else if (cstring.length ==  3){
			cstring = "0" + cstring;
		}
		counter++;
		return cstring;
	}

	this.getHexOutput = function(output){
		var res = "";
	    if(output < 0 && output >= -32) {
			output = 256 + output;
			res =  output.toString(16);
			
		}
		else if ( output < -32 ){
			output = 256 + output;
			res =  output.toString(16);
			res = "81" + res;
		}
		
		if (output >= 0 && output < 32) {
			res =  output.toString(16);
		}
		else if ( output >= 32 ) {
			res =  output.toString(16);
			res = "81" + res;
		}
		
		//one digit
		if (res.length == 1){
			res = "0" +res;
		}	
		
		return res;
	}

	this.loadProgram = function(callback){
		var connection = this.sp;
		main = this;
		connection.write(main.INIT_DOWNLOAD_SEQ,function(){ 
			connection.write(main.PROGRAM_SEQ,function(){ 
				connection.write(main.STOP_DOWNLOAD_SEQ,function(){ 
						if(callback != null) callback();
						//setupSensor();
				});	
			});
		});
	};
}; 

//-------------- Sensor ---------------------
Ev3_base.prototype.S_TYPE_IR = 0;
Ev3_base.prototype.S_TYPE_TOUCH = "10";
Ev3_base.prototype.S_TYPE_COLOR = "1d";
Ev3_base.prototype.S_TYPE_USONIC = 0;
Ev3_base.prototype.S_TYPE_GYRO = 0;


//color sensor modes
Ev3_base.prototype.SM_COL_RINTENSITY = 0;
Ev3_base.prototype.SM_COL_AINTENSITY = 1;
Ev3_base.prototype.SM_COL_COLOR = 2;

Ev3_base.prototype.sensors= [];

Ev3_base.prototype.sensorResponse = function(counter,value){
	for (i =0 ; i<this.sensors.length; i++){
		this.sensors[i].processData(counter,value);
	}
};

Ev3_base.prototype.registerSensor = function(port,type,mode){
	if(port>4 || port<1) {return; }//should return error
	if(type == this.S_TYPE_COLOR){
		this.sensors[port-1] = new ColorSensor(port,type,mode);
	}

	if(type == this.S_TYPE_TOUCH){
		this.sensors[port-1] = new TouchSensor(port,type,mode);
	}	
}

Ev3_base.prototype.registerSensorListener = function(port,callback){
	this.sensors[port-1].pushCallback(callback);
}

Ev3_base.prototype.pullReadings = function(){
	for (i =0 ; i<this.sensors.length; i++){
		this.sensors[i].pullReading(this.getCounter(),this.sp);
	}
}





// ------------- Connection ----------------

Ev3_base.prototype.connect = function(callback){ 
	var connection = this.sp;
	var main = this;

	connection.on("open", function () {
		//console.log('open');
		connection.on('data', function(data) {
			/*console.log('data received: ' + data.toString('hex')); 
			console.log('extract counter: ' + data.toString('hex').substr(4,4)); */
			main.sensorResponse(data.toString('hex').substr(4,4),data.toString('hex'));
		});

		//start sensing
		var sensing = function(){
			//var output = "0B00"+main.getCounter()+"0001009A00001d0260"; 
			/*var output = "0900000100050098046064"; 
			console.log("data sent ready"); 
			output = new Buffer(output,"hex");
			connection.write( output,function(){}); */

			main.pullReadings();

			setTimeout(function(){
				sensing();	
			},400);

			
		}

		sensing();
	}); 
	
	connection.open(function(err){
		connection.write(main.INIT_SEQ,function(){
			main.loadProgram(callback);
		});
		
	});  
};

Ev3_base.prototype.start_program =  function(callback){
	var main = this;
	this.sp.write(this.RUN_PROGRAM_SEQ,function(){	
		if(callback != null) callback(main);		
	}); 
};

Ev3_base.prototype.disconnect = function(callback){ 
	this.sp.write(this.TERMINATE_SEQ,function(err){
		 if(callback != null) callback(err);		
		 this.sp.close();
	}); 
}; 

// -------------- Export -------------
module.exports.base = Ev3_base;
