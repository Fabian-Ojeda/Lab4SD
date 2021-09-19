const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use("/static", express.static("static"));
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
    },

}

app.use(cors(
    config.application.cors.server
));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});