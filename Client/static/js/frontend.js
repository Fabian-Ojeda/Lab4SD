var localHour = new Date();
const socket = io("http://192.168.1.38:3000/time");

socket.on("change", (hoursIn, minutesIn, secondsIn) => {
    document.getElementById('tableHistory').innerHTML += `<tr>              
              <td>${localHour.getHours()+':'+localHour.getMinutes()+':'+localHour.getSeconds()}</td>
              <td>${hoursIn+'h:'+minutesIn+'m:'+secondsIn+'s'}</td>
              <td>${transformHour(hoursIn, minutesIn, secondsIn)}</td>              
            </tr>`

});

function printHour() {
    document.getElementById('hours').value = localHour.getHours()
    document.getElementById('minutes').value = localHour.getMinutes()
    document.getElementById('seconds').value = localHour.getSeconds()
}

function changeLocalHour() {
    localHour.setHours(document.getElementById('hours').value)
    localHour.setMinutes(document.getElementById('minutes').value)
    localHour.setSeconds(document.getElementById('seconds').value)
    alert('la hora local se ha cambiado correctamente')
}

function transformHour(hours, minutes, seconds) {
    var newDateInMiliseconds = localHour.getTime() - (hours * 3600000) - (minutes * 60000) - (seconds * 1000)
    localHour = new Date(newDateInMiliseconds)
    printHour()
    return localHour.getHours() + ':' + localHour.getMinutes() + ':' + localHour.getSeconds()
}

function sendFirstHour(){
    socket.emit('localHour', localHour.getTime())
}

setInterval(function() {
    socket.emit('localHour', localHour.getTime())
}, 20000)
printHour()

sendFirstHour()