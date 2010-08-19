var sys = require('sys'),
		http = require('http'),
		url = require('url'),
		fs = require("fs"),
		locked = false,
		
		// Global Vars
		messages = [];
		callbacks = [];

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// Server
http.createServer(function (req, res) {
	var parsed_req = url.parse(req.url, true);
	var callback = send_message;
	
	// Routes
	if (parsed_req.pathname == '/get/') callback = get_messages;
	
	//sys.puts(sys.inspect(parsed_req));
	callback(req, res, parsed_req);

}).listen(1112);

// Clean up hanging requests
setInterval(function() {
	if (locked == false) {
		sys.puts('clean up!', callbacks.length);
		var ts = Math.round(new Date().getTime() / 1000);
		for (i in callbacks) {
			if (callbacks[i]) {
				if ((callbacks[i].ts + 20) < ts) {
					return_blank(callbacks[i]);
					callbacks.remove(i);
				}
			}
		}
	}
}, 3000);

// Actions

function send_message(req, res, parsed_req) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('1');
	res.end();
	
	if (parsed_req.query.message || parsed_req.query.text_message) {
		img_msg = parsed_req.query.message || "";
		text_msg = parsed_req.query.text_message || "";
		name = parsed_req.query.name || "Nerd";
		
		// Sanitize Text
		text_msg += "";
		text_msg = text_msg.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
		
		messages.push({
			ts: Math.round(new Date().getTime() / 1000),
			message: img_msg,
			text_message: text_msg,
			name: name
		});
		
		sys.puts('text: '+text_msg);
		sys.puts('name: '+name);
		if (messages.length > 10) messages.shift();
	}
	
	if (callbacks.length > 0) {
		for (i in callbacks) {
			if(callbacks[i].callback) callbacks[i].callback(callbacks[i].req, callbacks[i].res, callbacks[i].parsed_req);
		}
		callbacks = [];
	}
	
	sys.puts('\n\n len: '+messages.length);
}

function get_messages(req, res, parsed_req) {
	value = [];
	
	locked = true;
	if (parsed_req.query.ts == 0) value = messages;
	else {
		for (i in messages) {
			if (parsed_req.query.ts < messages[i].ts) value.push(messages[i]);
		}
	}
	locked = false;
	
	if (value.length == 0) callbacks.push({
		ts: Math.round(new Date().getTime() / 1000),
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

function return_blank(callback) {
	sys.puts('clearing an old callback...');
	callback.res.writeHead(200, {'Content-Type': 'text/html'});
	callback.res.write(callback.parsed_req.query.callback+'([]);');
	callback.res.end();
}