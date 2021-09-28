const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const exec = require("child-process-async").exec;
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

app.use(express.json());

var arrayIdsHours = [];
var dateConsulted = new Date()
let ip_host_id = 150;
let server_list = []

io.of('/time').on('connection', (socket) => {
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
  io.emit('data', arrayIdsHours);
}

function sendHourToClients(socketId, hours, minutes, seconds) {
  io.of('/time').to(socketId).emit('change', hours, minutes, seconds)
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

function generateInstanceNetwork() {
  let ip = "192.168.1.";
  ip += ip_host_id;
  ip_host_id++;
  server_list.push(ip);
  createVM(ip, server_list.indexOf(ip));
}

function createVM(ip, id) {
  fs.mkdir("./resources/vm/" + id, (err) => {
    if (err && err.code != "EEXIST") throw "up";
    fs.writeFile(
      "./resources/vm/" + id + "/Vagrantfile",
      'Vagrant.configure("2") do |config|\n' +
        'config.vm.box = "matjung/nodejs14"\n' +
        'config.vm.network "public_network", ip: "' +
        ip +
        '"' +
        '\nconfig.vm.provision "shell", inline: <<-SHELL' +
        "\n apt-get update\n apt-get upgrade" +
        "\n sudo rm app"+
        "\n sudo mkdir app"+
        "\n cd app"+
        "\n git clone https://github.com/Fabian-Ojeda/Lab4SD.git" +
        "\n cd Lab4SD" +
        "\n cd Client"+
        "\n sudo npm i" +
        "\n sudo npm i -g pm2" +
        "\n pm2 start index.js" +
        "\nSHELL" +
        "\nend",
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("el archivo fue creado correctamente");
      }
    );
  });
  exec("cd resources/vm/" + id +"/&&vagrant up --provision");
}

app.post('/clock',(req, res)=>{
  generateInstanceNetwork();
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});