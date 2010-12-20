//This is a server for the [Quickdraw](http://files.bmdev.org/quickdraw/) app written 
//using node. The goal of this server is to accept messages that can contain
//both text and image data and relay that out to each member of the chat room.

//The breakdown is pretty simple. Server is just a light wrapper for a node
//http.Server and App is a namespace for all the application logic. This was
//a really lightweight app but I think the first thing I would change is move
//Server and App apart and decopule App from the Server because right now the
//App cares a little too much about things that it shouldn't. A especially
//good example of this is how App has to know how to respond.

// Load the modules required
var sys = require('sys'),
    http = require('http'),
    url = require('url'),
    fs = require("fs"),

//This code is from John Resig and it does its job but if I were to start over
//I would keep this code inside App.remove_callback because that is the only
//part in the code that I use Array.remove
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//###Server

var Server = function(port, routes) {
  // Make sure that `this` is accessible inside a Server object.
  var self = this;

  //As I said above this does its job but needs to help abstract some of the
  //other server functions away from App so that the App doesn't have to know
  //about things like how to respond to requests, how to format JSON, and other
  //things.

  this.init = function() {
    self.server = http.createServer(self.handle);
    self.server.listen(port);
  };

  // Handle each new request that comes into our server
  this.handle = function(req, res) {
    //Whenever we handle a new request we parse it to make its attributes more accessible.
    var parsed_req = url.parse(req.url, true);

    //The route system is very simple in this app. Each server gets passed in
    //a dict that contain a reference to a fuction. If the action is empty
    //meaning `http://127.0.0.1/` then we assume that this should be the root
    //action.
    var action = parsed_req.pathname.substr(1,parsed_req.pathname.length-2); 

    if (action.length === 0) action = 'root';
    if (routes[action]) routes[action](req, res, parsed_req);
  };

  this.init();
};


//###App
var App = {
  messages: [],
  callbacks: [],

  init: function() {
    setInterval(App.clean_up, 5000);
  },

  send_message: function(req, res, parsed_req) {
    if (parsed_req.query.message || parsed_req.query.text_message) {
      var msg = {
        message: parsed_req.query.message || "",
        text_message: parsed_req.query.text_message || "",
        name: parsed_req.query.name || "Nerd",
        ts: App.get_ts(),
      };

      if (msg.text_message) {
        // Sanitize Text
        msg.text_message += "";
        msg.text_msg = App.sanitize_text(msg.text_msg);
      }
      
      App.messages.push(msg);

      if (App.messages.length > 10) App.messages.shift();
    }
    
    if (App.callbacks.length > 0) {
      for (i in App.callbacks) {
        if(App.callbacks[i].callback) App.callbacks[i].callback(App.callbacks[i].req, App.callbacks[i].res, App.callbacks[i].parsed_req);
      }
      App.callbacks = [];
    }

    App.respond(true);
  },

  get_messages: function(req, res, parsed_req) {
    value = [];
    
    if (parsed_req.query.ts === 0) value = App.messages;
    else {
      for (i in App.messages) {
        if (App.messages[i] && parseInt(parsed_req.query.ts, 10) < parseInt(App.messages[i].ts, 10)) {
          value.push(App.messages[i]);
        }
      }
    }
    
    if (value.length === 0) {
      App.callbacks.push({
        ts: App.get_ts(),
        callback: App.get_messages,
        req: req,
        res: res,
        parsed_req: parsed_req
      });
    } else {
      App.respond(req, res, parsed_req, sys.inspect(value).split('\n').join(''));
    }
  },

  clean_up: function() {
    var now = App.get_ts();

    for (i in App.callbacks) {
      if (App.callbacks[i] && (App.callbacks[i].ts + (30 * 1000)) < now) {
        App.return_blank(App.callbacks[i]);
        App.callbacks.remove(i);
      }
    }
  },

  sanitize_text: function(text) {
    return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\\/g, "&#92;"); 
  }

  return_blank: function(req, res, parsed_req) {
    App.respond(req, res, parsed_req, '[]');
  },

  respond: function(req, res, parsed_req, msg) {
    var output = parsed_req.query.callback+'('+msg+');';

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(output);
    res.end();
  },

  get_ts: function() {
    return Math.round(new Date().getTime());
  }
};

App.init();
var server = new Server(2222, {
  'get': App.get_messages,
  'root': App.send_message
});
