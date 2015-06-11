console.log("Hello");

$(document).ready(function() {

	var irc = require(['irc']);
	var client = new irc.Client('199.9.252.26:6667', 'bdtzau', {
		channels: ['#twitchplayspokemon'],
	});
	
	client.addListener('error', function(message) {
		console.log('error: ', message);
	});
	
	client.join('#twitchplayspokemon oauth:x63ekcm489khjeylpgez4yx8sem5oa');
	
	client.addListener('message#twitchplayspokemon', function (from, message) {
		console.log(from + ' => #twitchplayspokemon: ' + message);
	});
});