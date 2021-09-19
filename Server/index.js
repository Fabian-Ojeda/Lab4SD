const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const config = {
  application: {
    cors: {
      server: [
        {
          origin: ('*'),
          credentials: true
        }
      ]
    }
  }
}

app.use(cors(
  config.application.cors.server
));

var arrayIdsHours = [];


var dateConsulted = new Date()


io.of('/chanel1').on('connection', (socket) => {

  var itemIdHour = {}
  itemIdHour.id = socket.id
  arrayIdsHours.push(itemIdHour)

  socket.on("localHour", (data) => {    
    refreshClientsHours(socket.id, data)
  });
});
/*
setTimeout(function() {
  var event = setInterval(function() {
    io.of('/chanel1').emit('message', 'vamos por buen camino')
  },2000)
},4000)*/
var eventConsultHour = setInterval(function () {
  consultHourFromApi()
}, 15000)

var eventSyncHour = setInterval(function () {
  syncHours()
}, 60000)



function consultHourFromApi() {
  axios.get('http://api.timezonedb.com/v2.1/get-time-zone?key=55837ZQHL3VN&format=json&fields=countryCode,countryName,regionName,timestamp,formatted&by=zone&zone=America/Bogota')
    .then(function (response) {
      dateConsulted = new Date(response.data.timestamp * 1000)
      var date = response.data.formatted
      dateConsulted.setHours(parseInt(date.substr(-8, 2)))
      //console.log('la hora con las horas cambiadas, son: ' + dateConsulted.getTime())      
    })
    .catch(function (error) {
      console.log('error');
    })
    .then(function () {
    });
}

function refreshClientsHours(socketId, data) {
  arrayIdsHours.forEach(element => {
    if (element.id == socketId) {
      var dataClient = new Date(data)      
      element.date = dataClient
    }
  });
  
}

function sendHourToClients(socketId, hours, minutes, seconds) {
  io.of('/chanel1').to(socketId).emit('change', hours, minutes, seconds)
}

function syncHours() {
  var localHour = dateConsulted;
  var difference = 0;
  arrayIdsHours.forEach(element => {
    difference+=(element.date.getTime()-localHour.getTime())
  });
  difference=difference/(arrayIdsHours.length+1)  
  var newValue = localHour.getTime()+difference
  var hours = 0;
  var minutes = 0;
  var seconds = 0;

  arrayIdsHours.forEach(element => {
    
    var result=element.date.getTime()-newValue
    if(result>0){
      if (result>=3600000){
        hours = Math.trunc(result/3600000)        
        result = result%3600000
      }if (result>=60000){
        minutes = Math.trunc(result/60000)
        result = result%60000
      }if(result>=1000){
        seconds = Math.trunc(result/1000)
      }
    }else{
      if (result<=-3600000){
        hours = Math.trunc(result/3600000)
        result = (result%3600000)
      }if (result<=-60000){
        minutes = Math.trunc(result/60000)
        result = (result%60000)
      }if(result<=-1000){
        seconds = Math.trunc(result/1000)
      }
          
    }
    sendHourToClients(element.id, hours, minutes, seconds)
  });
}



server.listen(3000, () => {
  console.log('listening on *:3000');
});