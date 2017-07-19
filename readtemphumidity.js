var noble = require('noble');
var state = 'poweredOn';

//b2c78014cac2452c991f7c221f36d20319cafdb7cf864




//works 
/* noble.on('discover', function(peripheral) {
    console.log('Found device with local name: ' + peripheral.advertisement.localName);
    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
    console.log();
}); */


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }
  
  if (peripheral.id == '060916420fed' || peripheral.id == '060916421003' || peripheral.id == '060916430ce5') {
	  var manufacturerData = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));
	  var temp = manufacturerData.substring(21, 23) + manufacturerData.substring(19, 21);
	  temp = (parseInt(temp, 16) / Math.pow(2, 16) * 165 - 40) * 9 / 5 + 32;
	  var humidity = parseInt(manufacturerData.substring(33, 35), 16);
	  var battery = parseInt(manufacturerData.substring(13, 15), 16);
	  console.log('\tbees found!');
	  console.log('\t\ttemperature: ' + JSON.stringify(temp.toFixed(2)));
	  console.log('\t\thumidity: ' + JSON.stringify(humidity.toFixed(2)));
	  console.log('\t\tbattery %: ' + JSON.stringify(battery.toFixed(2)));
	  
	  if (peripheral.id == '060916430ce5') {
		  var weightL = parseInt(manufacturerData.substring(27, 29), 16) * 256 + parseInt(manufacturerData.substring(25, 27), 16) - 32767;
		  weightL = weightL / 100;
		  var weightR = parseInt(manufacturerData.substring(31, 33), 16) * 256 + parseInt(manufacturerData.substring(29, 31), 16) - 32767;
		  weightR = weightR / 100;
		  var weightTotal = weightL + weightR;
		  console.log('\t\tweight: ' + JSON.stringify(weightTotal.toFixed(2)));
	  }
  }
  

  
  
  console.log();
});

