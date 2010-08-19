/**
 * Client.js
 * 
 * The purpose of this file is to hold all the app specific logic
 * for Quickdraw.
 * 
 * Such as:
 * - long polling to create real time updates
 * - sending the user data to the server
 * - managing user spcific settings such as pen color and app clearing the canvas
*/

var last_update = 0, 
		name,
		placeholder_text = 'Type a message',
		port = '1112',
		colorBtns = '#post ul li a',
		cssActive = 'active';

function poll() {
	$.ajax({
		url: 'http://bmdev.org:'+port+'/get/?ts='+last_update+'&callback=?',
		dataType: 'json',
		async: true,
		timeout: 50000,
		
		success: function(data) {
			last_update = Math.round(new Date().getTime() / 1000);
			var oHeight = $(".log").attr("scrollHeight");
			for (i in data) {
				c = '<li><span>'+data[i].name+'</span><p>';
				if (data[i].message.length > 0) c += '<img src="'+data[i].message.split(' ').join('+')+'"><br>';
				c += data[i].text_message+'</p></li>'
				$(".log").append(c);
			}
			var nHeight = $(".log").attr("scrollHeight");
			if( nHeight > oHeight ) {
				$(".log").stop(true).animate({scrollTop : nHeight},200);
			}
			poll();
		},
		
		error: function(err) {
			console.log('error!');
			poll();
		}
	});
}

$(function() {
	poll();
	
	var sub = function(e) {
		e.preventDefault();
		text_message = $('#msg').html();
		if (text_message == placeholder_text) text_message = '';
		
		if (has_data || text_message.length > 0)  {
			
			img = has_data? canvas.toDataURL():"";
			has_data = false;
			
			context.clearRect(0, 0, 380, 308);
			$('#msg').html(placeholder_text);
			
			$.get('http://bmdev.org:'+port+'/?message='+img+"&text_message="+text_message+"&name="+name);
		}
	}
	
	$("#send").click(sub);
	$('#send_form').submit(sub);
	
	$('#clr').click(function(e) {
		e.preventDefault();
		context.clearRect(0, 0, 380, 308);
		has_data = false;
	});
	
	$("#dk").click(function(e) {
		e.preventDefault();
		color = "#222222";
		$(colorBtns).removeClass(cssActive);
		$(this).addClass(cssActive);
	});
	
	$("#lt").click(function(e) {
		e.preventDefault();
		color = "#c10e0e";
		$(colorBtns).removeClass(cssActive);
		$(this).addClass(cssActive);
	});
	
	$('#chat').click(function(e) {
		e.preventDefault();
		name = $('#name').val();
		$('#modal').fadeOut('fast');
	});
	
	// canvas cursor fix
	var cvs = document.getElementById('draw'); 
	cvs.onselectstart = function () { return false; }; // ie 
	cvs.onmousedown = function () { return false; }; // moz

	// auto select text on focus of input
	$('#msg,#name').focus(function(){this.select();});
	
});