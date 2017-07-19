function function1() {
    // stuff you want to happen right away
    console.log('Welcome to My Console,');
}

function function2() {
    // all the stuff you want to happen after that pause
    //google sheet stuff
var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var async = require('async');
var moment = require('moment');
//ble stuff
var periphindx = ['060916420fed', '060916421003', '060916430ce5'];
var noble = require('noble');
var state = 'poweredOn';

require('dns').resolve('www.google.com', function(err) {
  if (err) {
     console.log("No connection, break");
  } else {
     console.log("Connected");
  }
});

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


function Peripheral(){
	//******
	//This function monitors how many of the (3) BLE devices we care about 
	// have succesfully connected. Once everyone has connected, we can stop scanning since
	// peripheral.count == 3
	//******
  if(Peripheral.count == undefined){
    Peripheral.count = 1;
  }
  else{
    Peripheral.count ++;
  }
  console.log(Peripheral.count);
}

var Probe = function (name, temp, humid, weight, battery) {
	//make an object for each sensor 
    this._Name = name;
    this._Temperature = temp;
    this._Humidity = humid;
    this._Weight = weight;
    this._Battery = battery;
};


noble.on('discover', function(peripheral) {
	//******
	//This function does all of the BTLE scanning/data grabbing from the broodminder BTLE electronics
	//******
	if (peripheral.id == '060916420fed' || peripheral.id == '060916421003' || peripheral.id == '060916430ce5') {
		//only want to grab these peripheral ids, other stuff in airwaves is not relevant to us.
		//add || "newdeviceaddress" ) as needed in later updates..
		var moment = require('moment'); //package for time stamps
		var TestTime = moment().utc(String); //part of JSON packet later?
		console.log('\x1b[36m%s\x1b[0m', TestTime);
		console.log("Json time key still needs to be implemented"); //send time as string? 
		if (peripheral.id == '060916420fed') {
			var p1 = new Peripheral(); 
			console.log("Probe 1 Found");
			var origin = "Probe1topTH";
			//Manufacturer Data contains all of the BLE sensors info. Reference broodminder guide/datasheet if
			//you want to know more about register locations and values 
			//https://dl.dropboxusercontent.com/u/4212478/BroodMinder-User-Guide-for-V2_40.pdf
			//Page 45
			var manufacturerData = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));
			var temp = manufacturerData.substring(21, 23) + manufacturerData.substring(19, 21);
			temp = (parseInt(temp, 16) / Math.pow(2, 16) * 165 - 40) * 9 / 5 + 32;
			var humidity = parseInt(manufacturerData.substring(33, 35), 16);
			var battery = parseInt(manufacturerData.substring(13, 15), 16);
			var weight = 0; //this sensor is not a scale 
			console.log(temp);
			console.log("Dont hardcode devideId");
			//probably should do this stringify in the connect function chain
			var SendPacket = JSON.stringify({ deviceId: "Hive1@43", origin: origin, battery: battery, temperature: temp, humidity: humidity });
			//pass object instead of json packet??
			//Declare an object and pass this to connect()
			global.Probe1 = new Probe(origin, temp, humidity, weight, battery);
			//check functionality of object
			console.log(Probe1._Name);
			console.log(Probe1._Temperature);
			console.log(typeof(Probe1._Temperature));
			console.log('\x1b[36m%s\x1b[0m',SendPacket);  
			//******
			//Calling Connect(ProbeObject) function does all of the Registering with azure and actual JSON sending. 
			// Probeobject should contain the data for one of the three probes 
			// this data will be sent via JSON 
			//currently Connect() is in console.log to display whats going on... 
			//Should I send the packet without device id and add it later based on register request promise? 
			//******
			
			//console.log(Connect(Probe1));
			console.log("Connect was called, look for results now!");
			
		}
		else if (peripheral.id == '060916421003') {
			
			var p2 = new Peripheral();
			console.log("Probe 2 Found");
			var origin = "Probe2botTH";
			var manufacturerData = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));
			var temp = manufacturerData.substring(21, 23) + manufacturerData.substring(19, 21);
			temp = (parseInt(temp, 16) / Math.pow(2, 16) * 165 - 40) * 9 / 5 + 32;
			var humidity = parseInt(manufacturerData.substring(33, 35), 16);
			var battery = parseInt(manufacturerData.substring(13, 15), 16);
			var weight = 0; //this sensor is not a scale 
			var SendPacket = JSON.stringify({ deviceId: "Hive1@43", origin: origin, battery: battery, temperature: temp, humidity: humidity });
			console.log('\x1b[36m%s\x1b[0m',SendPacket);
			//Declare an object and pass this to connect()
			global.Probe2 = new Probe(origin, temp, humidity, weight, battery);
		}
		else if (peripheral.id == '060916430ce5') {
			var p3 = new Peripheral();
			console.log("Scale Found");
			var origin = "Probe3Scale";
			var manufacturerData = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));
			var temp = manufacturerData.substring(21, 23) + manufacturerData.substring(19, 21);
			//is it bad coding practice to label these as temp and not temp3? 
			temp = (parseInt(temp, 16) / Math.pow(2, 16) * 165 - 40) * 9 / 5 + 32;
			var humidity = parseInt(manufacturerData.substring(33, 35), 16);
			var battery = parseInt(manufacturerData.substring(13, 15), 16);
			var weightL = parseInt(manufacturerData.substring(27, 29), 16) * 256 + parseInt(manufacturerData.substring(25, 27), 16) - 32767;
			weightL = weightL / 100;
			var weightR = parseInt(manufacturerData.substring(31, 33), 16) * 256 + parseInt(manufacturerData.substring(29, 31), 16) - 32767;
			weightR = weightR / 100;
			var weightTotal = 2*(weightL + weightR);
			console.log('\t\tweight: ' + JSON.stringify(weightTotal.toFixed(2)));
			var SendPacket = JSON.stringify({ deviceId: "Hive1@43", origin: origin, battery: battery, temperature: temp, humidity: humidity, weight: weightTotal });
			console.log('\x1b[36m%s\x1b[0m',SendPacket);
			//Declare an object and pass this to connect()
			global.Probe3 = new Probe(origin, temp, humidity, weightTotal, battery);
			
		}
		else {
			console.log("Peripheral in given index not found, exiting after X amount of time");
		}	
	
	if (Peripheral.count == 3) {
		console.log(Peripheral.count + ",  peripheral count now 3, exiting after upload complete");
		//this will only run after all three devices have been connected to. Function Peripheral is just a counter for each peripheral.
		// need a data sent check flag too... or it will quit before it is done..  
		noble.stopScanning();
		var GoogleSpreadsheet = require('google-spreadsheet');
		var creds = require('./client_secret.json');
		var dev1row = {Identity: Probe1._Name, Timestamp: moment().format("M/D/YYYY HH:mm:ss"), Temperature: Probe1._Temperature, Humitidy: Probe1._Humidity, Battery: Probe1._Battery, Weight: Probe1._Weight}; 
		var dev2row = {Identity: Probe2._Name, Timestamp: moment().format("M/D/YYYY HH:mm:ss"), Temperature: Probe2._Temperature, Humitidy: Probe2._Humidity, Battery: Probe2._Battery, Weight: Probe2._Weight}; 
		var dev3row = {Identity: Probe3._Name, Timestamp: moment().format("M/D/YYYY HH:mm:ss"), Temperature: Probe3._Temperature, Humitidy: Probe3._Humidity, Battery: Probe3._Battery, Weight: Probe3._Weight}; 
		var doc = new GoogleSpreadsheet('1U4X0rNfJtiapiL0K1YHOY5Mq9vRP5yA3T__XbXg3D3M');
		doc.useServiceAccountAuth(creds, function (err) { 
			  // Get all of the rows from the spreadsheet.
			  doc.getRows(1, function (err, rows) {
				console.log(rows);
			  });
			  doc.getInfo(function (err, info) {
				console.log(info);
			  });
			  doc.addRow(1,dev1row, function (err, addrow) {
				console.log(addrow);
			  });
			  doc.addRow(1,dev2row, function (err, addrow) {
				console.log(addrow);
			  });
			  doc.addRow(1,dev3row, function (err, addrow) {
				console.log(addrow);
			  });
			  
			  
			});
		console.log("All 3 devices found and uploaded");
		console.log("Data_Uploaded to cloud flag still needs to be implemented, right now just dont exit until you see message enqueued");
		console.log("Press ctl C to quit/ implement exit and shutdown later");
		//process.exit()
	}
	}
});
}

// call the first chunk of code right away
function1();

// call the rest of the code and have it execute after 30 seconds
setTimeout(function2, 15000);

