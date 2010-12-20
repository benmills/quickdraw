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
		placeholder_text = 'Type a message',
		port = '2222',
		colorBtns = '#post ul li a',
		cssActive = 'active';

function poll() {
	$.ajax({
		url: 'http://127.0.0.1:'+port+'/get/?ts='+last_update+'&callback=?',
		dataType: 'json',
		async: true,
		timeout: 50000,
		
		success: function(data) {
			for (i in data) {
				c = '<li><span>'+data[i].name+'</span><p>';
				if (data[i].message.length > 0) c += '<img height="200px" src="'+data[i].message.split(' ').join('+')+'"><br>';
				c += data[i].text_message+'</p></li>';
				$(".log").append(c);
			}
			
			if (data[0]) last_update = data[data.length-1].ts;
			$('.log').stop(true).animate({scrollTop: $(".log").attr("scrollHeight")},360);
			poll();
		},
		
		error: function(err) {
			poll();
		}
	});
}

$(function() {
	var n;

	poll();
	$('#msg').val(placeholder_text);
	
	var sub = function(e) {
		e.preventDefault();
		text_message = $('#msg').val();
		if (text_message.replace(/^\s*|\s*$/g,'') == placeholder_text.replace(/^\s*|\s*$/g,'')) text_message = '';
		
		if (has_data || text_message.length > 0)  {
			
			img = has_data? canvas.toDataURL():"";
			has_data = false;
	
			context.clearRect(0, 0, 380, 308);
			$('#msg').val('');
			$.getJSON('http://127.0.0.1:'+port+'/?message='+img+"&text_message="+text_message+"&name="+n+"&jsoncallback=?");
		}
	};
	
	$("#send").click(sub);
	$('#send_form').submit(sub);
	
	$('#msg').keyup(function(e) {
		e.preventDefault();
		if (e.keyCode === 13) {
			sub(e);
		 }
	});
	
	$('#msg').focus(function() {
		this.select();
	});
	
	var handle_name = function(e) {
		e.preventDefault();
		n = $('#name').val();
		$('#modal').fadeOut('fast');
	};
	
	$('#name_form').submit(handle_name);
	$('#chat').click(handle_name);
	
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
	
	// canvas cursor fix
	var cvs = document.getElementById('draw'); 
	cvs.onselectstart = function () { return false; }; // ie 
	cvs.onmousedown = function () { return false; }; // moz

	// auto select text on focus of input
	$('#name').focus();
	$('#name').select();
	
});
