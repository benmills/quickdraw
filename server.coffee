# Load the modules required
sys = require('util')
http = require('http')
url = require('url')
fs = require("fs")

#This code is from John Resig and it works but I would like to move it
#into App.remove_callback or into a util file because it is used once.
Array.prototype.remove = (from, to) ->
  rest = this.slice((to || from) + 1 || this.length)
  this.length = from < 0 ? this.length + from : from
  return this.push.apply(this, rest)



class Server
  constructor: (@port, @routes) ->
    @server = http.createServer(self.handle)
    @server.listen(port)

    handle: (req, res) ->
      parsed_req = url.parse(req.url, true)
      action = parsed_req.pathname.substr(1,parsed_req.pathname.length-2)

      action = 'root' if action.length == 0
      @routes[action](req, res, parsed_req) if @routes[action]


class App
  constructor: ->
    @messages = []
    @callbacks = []
    setInterval(self.clean_up, 5000)
 #App =
  #messages: []
  #callbacks: []

  #init: ->
    #setInterval(App.clean_up, 5000)

  #get_messages: (req, res, parsed_req) ->
    #value = []
   
    #value = App.messages if parsed_req.query.ts === 0

    #else
      #for i in App.messages
        #if App.messages[i] and parseInt(parsed_req.query.ts, 10) < parseInt(App.messages[i].ts, 10)
          #value.push(App.messages[i])
    
    #if value.length === 0
      #App.callbacks.push({
        #ts: App.get_ts(),
        #callback: App.get_messages,
        #req: req,
        #res: res,
        #parsed_req: parsed_req
      #})
   #else
      #App.respond(req, res, parsed_req, sys.inspect(value).split('\n').join(''))

  #send_message: (req, res, parsed_req) ->
    #if parsed_req.query.message || parsed_req.query.text_message
       #msg =
        #message: parsed_req.query.message || ""
        #text_message: parsed_req.query.text_message || ""
        #name: parsed_req.query.name || "Nerd"
        #ts: App.get_ts()

      #if msg.text_message
        #msg.text_message += ""
        #msg.text_msg = App.sanitize_text(msg.text_msg)
      
      #App.messages.push(msg)
      #App.messages.shift() if App.messages.length > 10
    
    #if App.callbacks.length > 0
      #for i in App.callbacks
         #callback = App.callbacks[i]
         #callback.callback(callback.req, callback.res, callback.parsed_req) if(callback)
      #App.callbacks = []

    #App.respond(true)
  
  #clean_up: ->
     #now = App.get_ts()

    #for i in App.callbacks
      #if App.callbacks[i] && (App.callbacks[i].ts + (30 * 1000)) < now
        #App.return_blank(App.callbacks[i])
        #App.callbacks.remove(i)

  #sanitize_text: (text) ->
    #text.replace(/&/g, "&amp")
        #.replace(/>/g, "&gt")
        #.replace(/</g, "&lt")
        #.replace(/"/g, "&quot")
        #.replace(/\\/g, "&#92")

  #return_blank: (req, res, parsed_req) ->
    #App.respond(req, res, parsed_req, '[]')

  #respond: (req, res, parsed_req, msg) ->
    #output = parsed_req.query.callback+'('+msg+')'

    #res.writeHead(200, {'Content-Type': 'text/html'})
    #res.write(output)
    #res.end()

  #get_ts: ->
    #Math.round(new Date().getTime())

#App.init()
#server = new Server(2222, {
  #'get': App.get_messages,
  #'root': App.send_message
#})
