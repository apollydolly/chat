var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var moment = require('moment')
server.listen(3000);
var address, type, url;

app.use('/style', express.static('style'));
app.get('/', function(request, response){
    address=request.socket.remoteAddress;
    type=request.method;
    url = request.protocol + '://' + request.get('host') + request.originalUrl;
    response.sendFile(__dirname + '/index.html');
});

connections = [];

io.sockets.on('connection', function(socket) {
	console.log("Успешное соединение");
	connections.push(socket);

    socket.on('set name', function(data) {
        socket.username = data.name;
        console.log("Пользователь " + data.name + " вошел в чат");

        var day="[" + moment().format('<YYYY-MM-DD> hh:mm:ss') + "]";
        var rec = day + "   " + address + "   " + type + "   " + url + "\n";
        console.log(rec);
        fs.appendFile('chat.log', rec, function(err){
            if (err){
                console.error('Ошибка записи в лог-файл:', err);
            }
        });

        io.sockets.emit('add mess', {mess: 'пользователь ' + data.name + ' вошел в чат', name: 'Сервер'});
      });

    socket.on('disconnect', function(data) {
		connections.splice(connections.indexOf(socket), 1);
		console.log("Отключились");
        setTimeout(() => {
            console.log("Пользователь " + socket.username + " отключился");

        io.sockets.emit('add mess', {mess: 'пользователь ' + socket.username + ' покинул чат', name: 'Сервер'});
        }, 60000);
	});

	socket.on('send mess', function(data) {
		io.sockets.emit('add mess', {mess: data.mess, name: socket.username});
	});
});
