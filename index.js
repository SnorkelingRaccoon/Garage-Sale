var express = require('express');
var favicon = require('serve-favicon');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

//var names = ['Josh', 'Jody', 'Jeff', 'Sarah', 'Melanie', 'Sam', 'Kim', 'Bob', 'Bethany', 'Derik'];
var names = [];
var inGarageSale = false;


app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.png'));

//---------------- Router ------------------------------------------------------------------------------
//Root route
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


//Check path to see the name is valid
app.param('name', function(req, res, next, name) {
	for(var i=0; i<names.length; i++) {
	    if(names[i] == name) {
		    req.name = name;
			return next();
		}
	}
	return next(new Error("Name Doesn't Exist for the Current Garage Sale"));
});

//Dynamic path router for valid names
app.get('/:name', function(req, res, next){
    //if(req.name == "ERROR IS REAL")
	//    res.send("Error!  Invalid Path");
	//else
        res.sendFile(__dirname + '/fileupdater.html');
});

//All other paths (error)
app.get('/*', function(req, res, next) {
    next(new Error("Invalid Path"));
});

//Error handler
app.use(function(err, req, res, next) {
    var errStr = err.toString();
	errStr = errStr.substring(7, errStr.length);
    res.status(500);
	res.send('<h1 style="font-family:calibri,arial,sans-serif;">ERROR</h1>' +
	         '<span style="font-family:calibri,arial,sans-serif;font-size:120%;">'+errStr+'</span><br>' +
			 '<span style="font-family:calibri,arial,sans-serif;font-size:110%;">Try a different path</span>');
});
//------------------------------------------------------------------------------------------------------

io.on('connection', function(socket){   
	socket.on('connection', function(data) {
		socket.emit('in garage sale', inGarageSale, names);
	});
   
   for(var i=0; i<names.length; i++) {
       socket.on(names[i], function(data) {
           socket.emit('welcome', 'Welcome, ' + data);
       });
   }
   
	socket.on('new sale', function(data) {
	    if(!inGarageSale) {
			inGarageSale = true;
			names = data.slice();
			//nameRegex = '/:var(';
			//for(var i=0; i<names.length-1; i++) 
			//	nameRegex += names[i]+'|';
			//nameRegex += names[names.length-1]+')';	

			//console.log(nameRegex);
			
			io.emit('in garage sale', true, names);
		}
	});
   
    socket.on('end sale', function(data) {
	    names = [];
		inGarageSale = false;
		io.emit('sale over', true);
	});
   
   
	socket.on('disconnect?', function(data) {
	    if(data)
		    socket.emit('refresh', 'now');
	});
   /*
   socket.on('Jody', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Jeff', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Sarah', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Melanie', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Sam', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Bethany', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Derik', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Kim', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   
   socket.on('Bob', function(data) {
       socket.emit('welcome', 'Welcome, ' + data);
   });
   */
});

http.listen(8000, function(){
    console.log('listening on *:8000');
});