// Load the modules required
var sys = require('util'),
    http = require('http'),
    url = require('url'),
    fs = require("fs")

//This code is from John Resig and it works but I would like to move it
//into App.remove_callback or into a util file because it is used once.
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


//###Server

var Server = function(port, routes) {
  // Make sure that `this` is accessible inside a Server object.
  var self = this;

  this.init = function() {
    self.server = http.createServer(self.handle);
    self.server.listen(port);
  };

  // Handle each new request that comes into our server
  this.handle = function(req, res) {
    //Whenever we handle a new request we parse it to make its attributes more accessible.
    sys.debug(sys.inspect(req))
    var parsed_req = url.parse(req.url, true);
    sys.debug(sys.inspect(parsed_req))

    //The route system is very simple in this app. Each server gets passed in
    //a dictionary that contain a reference to a fuction. If the action is empty
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
  // Messages hold the last 10 message objects
  messages: [],
  // Callbacks hold requests that are waiting to be responded to
  callbacks: [],

  init: function() {
    setInterval(App.clean_up, 5000);
  },

  // The basic idea here is if the request is the first request of a new user
  // or if there are new messages from the time this request was made. If not,
  // store this request as a callback that will be responded to when there is
  // a new message.
  get_messages: function(req, res, parsed_req) {
    value = [];
   
    // Check to see if this is the inital page load, if it is return all
    // messages.
    if (parsed_req.query.ts === 0) value = App.messages;
    else {
      for (i in App.messages) {
        if (App.messages[i] && 
            parseInt(parsed_req.query.ts, 10) < parseInt(App.messages[i].ts, 10)) {
          value.push(App.messages[i]);
        }
      }
    }
    
    // Make sure that we have messages to return, if we don't store this
    // request as a callback to be responded to when we have a new message for it.
    if (value.length === 0) {
      App.callbacks.push({
        ts: App.get_ts(),
        callback: App.get_messages,
        req: req,
        res: res,
        parsed_req: parsed_req
      });
    } else {
      // Return the new messages as JSON
      App.respond(req, res, parsed_req, sys.inspect(value).split('\n').join(''));
    }
  },

  // Get the message and make sure that each field is valid or replace it with
  // a default value then add the message to the array
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

      // If App is holding too many messages remove the oldest one
      if (App.messages.length > 10) App.messages.shift();
    }
    
    // Now that a new message has been added we check to see if there are any
    // callbacks that are hanging so we can push the new message to them
    if (App.callbacks.length > 0) {
      for (i in App.callbacks) {
        var callback = App.callbacks[i];
        // This code is hairy, I would like to store the callbacks in a better
        // way to make this code more clear.
        if(callback) callback.callback(callback.req, callback.res, callback.parsed_req);
      }
      App.callbacks = [];
    }

    // Finish up the send_message request by responding back to the message
    // sender
    App.respond(true);
  },
  
  // If a request is hanging for too long respond to it with nothing.
  clean_up: function() {
    var now = App.get_ts();

    for (i in App.callbacks) {
      if (App.callbacks[i] && (App.callbacks[i].ts + (30 * 1000)) < now) {
        App.return_blank(App.callbacks[i]);
        App.callbacks.remove(i);
      }
    }
  },

  // Escape HTML tags. This is far from a fool-proof system and needs to have
  // a much more robust way of sanitizing the data.
  sanitize_text: function(text) {
    return text.replace(/&/g, "&amp;")
               .replace(/>/g, "&gt;")
               .replace(/</g, "&lt;")
               .replace(/"/g, "&quot;")
               .replace(/\\/g, "&#92;"); 
  },

  return_blank: function(req, res, parsed_req) {
    App.respond(req, res, parsed_req, '[]');
  },

  respond: function(req, res, parsed_req, msg) {
    sys.debug(sys.inspect(parsed_req))
    var output = parsed_req.query.callback+'('+msg+');';

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(output);
    res.end();
  },

  get_ts: function() {
    return Math.round(new Date().getTime());
  }
};

// Set up the app and server with the two routes for our application.
App.init();
var server = new Server(2222, {
  'get': App.get_messages,
  'root': App.send_message
});
