var last_update = 0;
var HOST = '127.0.0.1';

function poll() {
	$.ajax({
		url: 'http://'+HOST+':1111/get/?ts='+last_update+'&callback=?',
		dataType: 'json',
		success: function(data) {
			last_update = Math.round(new Date().getTime() / 1000);
			for (i in data) $("#messages").append('<div class="post"><img src="'+data[i].message.split(' ').join('+')+'"></div>');
			$(document).scrollTop($(document).height());
		},
		complete: poll
	});
}

$(function() {
	poll();
	
	$("#save").click(function(e) {
		e.preventDefault();
		if (has_data)  {
			$.get('http://'+HOST+':1111/?message='+canvas.toDataURL());
			canvas.width = canvas.width; // Clear canvas
			has_data = false;
		}
	});
	
	$('#clear').click(function(e) {
		e.preventDefault();
		canvas.width = canvas.width; // Clear canvas
		has_data = false;
	});
	
	$('#expand').click(function(e) {
		e.preventDefault();
		if ($(this).html() == '+') {
			$('#poster').animate({height:'365px'}, 1000);
			$('#draw_box').animate({height:'365px'}, 1000);
			canvas.height = 365; // Clear canvas
			has_data = false;
			$(this).html('-');
		} else {
			$('#poster').animate({height:'182px'}, 1000);
			$('#draw_box').animate({height:'182px'}, 1000);
			canvas.height = 182; // Clear canvas
			has_data = false;
			$(this).html('+');
		}
	});
	
	$("#blue").click(function(e) {
		e.preventDefault();
		$("#blue").removeClass('off');
		$('#white').addClass('off');
		color = "#0000FF";
	});
	
	$("#white").click(function(e) {
		e.preventDefault();
		$("#white").removeClass('off');
		$('#blue').addClass('off');
		color = "#EEEEEE";
	});
	
});