var canvas, context, tool, has_data = false, color = "#EEEEEE";

// This painting tool works like a drawing pencil which tracks the mouse 
// movements.
function tool_pencil () {
  var tool = this;
  this.started = false;

  // This is called when you start holding down the mouse button.
  // This starts the pencil drawing.
  this.mousedown = function (ev) {
      context.beginPath();
      context.moveTo(ev._x, ev._y);
			context.lineWidth   = 2;
			context.strokeStyle = color;
      tool.started = true;
  };

  // This function is called every time you move the mouse. Obviously, it only 
  // draws if the tool.started state is set to true (when you are holding down 
  // the mouse button).
  this.mousemove = function (ev) {
    if (tool.started) {

      context.lineTo(ev._x, ev._y);
      context.stroke();
			has_data = true;
    }
  };

  // This is called when you release the mouse button.
  this.mouseup = function (ev) {
    if (tool.started) {
      tool.mousemove(ev);
      tool.started = false;
    }
  };

	this.mouseout = function (ev) {
    if (tool.started) {
      tool.mousemove(ev);
      tool.started = false;
    }
  };

	// this.touchcancel = this.mouseout;
	// this.touchend = this.mouseup;
	// this.touchmove = this.mousemove;
	// this.touchstart = this.mousedown;
}

// The general-purpose event handler. This function just determines the mouse 
// position relative to the canvas element.
function ev_canvas (ev) {
  if (ev.layerX || ev.layerX == 0) { // Firefox
    ev._x = ev.layerX;
    ev._y = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    ev._x = ev.offsetX;
    ev._y = ev.offsetY;
  }

  // Call the event handler of the tool.
  var func = tool[ev.type];
  if (func) {
    func(ev);
  }
}

$(function() {
	
	// Find the canvas element.
  canvas = document.getElementById('draw_box');
  if (!canvas) {
    alert('Error: I cannot find the canvas element!');
    return;
  }

  if (!canvas.getContext) {
    alert('Error: no canvas.getContext!');
    return;
  }

  // Get the 2D canvas context.
  context = canvas.getContext('2d');
  if (!context) {
    alert('Error: failed to getContext!');
    return;
  }

  // Pencil tool instance.
  tool = new tool_pencil();

  // Attach the mousedown, mousemove and mouseup event listeners.
  canvas.addEventListener('mousedown', ev_canvas, false);
  canvas.addEventListener('mousemove', ev_canvas, false);
  canvas.addEventListener('mouseup',   ev_canvas, false);
	canvas.addEventListener('mouseout',   ev_canvas, false);
	
	// canvas.addEventListener('touchstart', ev_canvas, false);
	//   canvas.addEventListener('touchmove', ev_canvas, false);
	//   canvas.addEventListener('touchend',   ev_canvas, false);
	// canvas.addEventListener('touchcancel',   ev_canvas, false);
	
});