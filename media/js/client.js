var last_update = 0, 
		name=prompt("Please enter your name","Nerd"), 
		placeholder_text = 'Type a message here';

function poll() {
	$.ajax({
		url: 'http://bmdev.org:1111/get/?ts='+last_update+'&callback=?',
		dataType: 'json',
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
		}
	});
}

$(function() {
	poll();
	
	$("#say").click(function(e) {
		e.preventDefault();
		text_message = $('#msg').val();
		if (text_message == placeholder_text) text_message = '';
		
		if (has_data || text_message.length > 0)  {
			
			img = has_data? canvas.toDataURL():"";
			has_data = false;
			
			context.clearRect(0, 0, 735, 198);
			$('#msg').val(placeholder_text);
			
			$.get('http://bmdev.org:1111/?message='+img+"&text_message="+text_message+"&name="+name);
		}
	});
	
	$('#clr').click(function(e) {
		e.preventDefault();
		context.clearRect(0, 0, 735, 198);
		has_data = false;
	});
	
	$("#dk").click(function(e) {
		e.preventDefault();
		color = "#222222";
	});
	
	$("#lt").click(function(e) {
		e.preventDefault();
		color = "#c10e0e";
	});
	
	// canvas cursor fix
	var cvs = document.getElementById('draw'); 
	cvs.onselectstart = function () { return false; }; // ie 
	cvs.onmousedown = function () { return false; }; // moz

	// auto select text on focus of input
	$('#msg').focus(function(){this.select();});
	
});