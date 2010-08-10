var sys = require('sys'),
		http = require('http'),
		url = require('url'),
		fs = require("fs"),
		
		// Global Vars
		messages = [];
		callbacks = [];

// Server
http.createServer(function (req, res) {
	var parsed_req = url.parse(req.url, true);
	var callback = send_message;
	
	// Routes
	if (parsed_req.pathname == '/get/') callback = get_messages;
	
	//sys.puts(sys.inspect(parsed_req));
	callback(req, res, parsed_req);

}).listen(1111);

// Actions

function send_message(req, res, parsed_req) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('1');
	res.end();
	
	if (parsed_req.query.message) {
		messages.push({
			ts: Math.round(new Date().getTime() / 1000),
			message: parsed_req.query.message
		});
		if (messages.length > 10) messages.shift();
	}
	
	if (callbacks.length > 0) {
		for (i in callbacks) {
			callbacks[i].callback(callbacks[i].req, callbacks[i].res, callbacks[i].parsed_req);
		}
		callbacks = [];
	}
	
	sys.puts('\n\n'+messages.length);
}

function get_messages(req, res, parsed_req) {
	value = [];
	
	if (parsed_req.query.ts == 0) value = messages;
	else {
		for (i in messages) {
			if (parsed_req.query.ts < messages[i].ts) value.push(messages[i]);
		}
	}
	
	if (value.length == 0) callbacks.push({
		callback: get_messages,
		req: req,
		res: res,
		parsed_req: parsed_req
	});
	else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(parsed_req.query.callback+'('+sys.inspect(value).split('\n').join('')+');');
		res.end();
	}
}