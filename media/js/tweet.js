/**
 * tweet.js
 * 
 * pull in tweet when a tweet link is posted
*/

// https://twitter.com/mayoremanuel/status/40586901115109376

var Twt = {};

Twt.url = '';
Twt.callback = function(){};

Twt.init = function (url, callback) {
	
	Twt.url = url.toString();
	Twt.callback = callback;
	
	if ( Twt.isTweet(Twt.url) ) {
	
		Twt.getTweet();
	
	} else {
	
		return;
		
	}
	
};

Twt.isTweet = function () {
	
	if ( Twt.url.indexOf('twitter.com/') != -1 && Twt.url.indexOf('/status') != -1 ) {
	
		return true;
		
	} else {
	
		return false;
		
	}
	
};

Twt.getTweet = function () {
	
	var tweet_id = $(Twt.url.split('/')).last();
	
	console.log(tweet_id);
	
	$.getJSON(
		"http://api.twitter.com/1/statuses/show/" + tweet_id[0].toString() + '.json?callback=?',
		function(data){
			Twt.callback(data.text);
		}
	);
	
};

//$(function() {
	
//	  Twt.init('https://twitter.com/scrittenden/status/36600073722933248');
	
//});