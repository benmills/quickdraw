/**
 * Draw.js
 * 
 * The purpose of this file is to hold all the logic so that 
 * users can draw by clicking and holding down in a canvas element
*/

var canvas, 
		context, 
		has_data = false, // Flag that changes to true when the user used the pen
		color = "#222222", // The default pen color
		started = false, // Flag that is used for the mouseout and mouseup events
		
		// Draw is what actually creates the drawing
		draw=function (e) {
  		if (started) {
				e = calc(e);
				context.lineTo(e._x, (e._y-50));
				context.stroke();
				has_data = true;
  		}
		}, 
		
		// Calc finds the relative cords inside the canvas
		calc=function(e) {
			if (e.layerX || e.layerX == 0) { // Firefox
    		e._x = e.layerX;
    		e._y = e.layerY;
  		} else if (e.offsetX || e.offsetX == 0) { // Opera
    		e._x = e.offsetX;
    		e._y = e.offsetY;
  		}
			return e;
		};

$(function() {
  canvas = document.getElementById('draw');
  context = canvas.getContext('2d');
	
	// Bind the canvas element to the mouse events
	$('#draw')
	.mousedown(function(ev) {
		context.beginPath();
		ev = calc(ev); 
    context.moveTo(ev._x, ev._y);
		context.lineWidth   = 2;
		context.strokeStyle = color;
    started = true;
	})
	.mousemove(draw)
	.mouseup(function(ev) {
		if (started) {
      started = false;
			draw(ev);
    }
	})
	.mouseout(function(ev) {
		if (started) {
      started = false;
			draw(ev);
    }
	});
	
});