var sys = require('sys');

var Server = function() {
  var self = this;

  this.init = function() {
    this.name = "mills";
    self.whoa = "jess";
  };
};

var s = new Server();
sys.log(s.test);
s.init();
//sys.log(s.name);
sys.log(s.whoa);
