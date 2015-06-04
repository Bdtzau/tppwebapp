// ___server stuff; add later___
// var http = require('http');
// console.log('Server running at http://127.0.0.1:1337/');

// RegExp
var username_re = /@[\S]+/g;
var commaDigit_re = /[\d|,]+/g;
var bet_re = /^(!bet\s)/ig;
var team_re = /(red)|(blue)/ig;

// Variables
var x = 0;
var tempMsg, tempName, tempGold, tempTeam, tempBet;
var duringBattle = true;
var duringBetting = false;
var playerList = {};

var Player = function(name) {
	this.playerName = name;
	this.playerGold = 0;
	this.playerGoldString = "0";
	this.playerBet = 0;
	this.playerTeam = "";
	console.log("Player " + this.playerName + " created");
}

var Team = function() {
	this.teamGold = 0;
	this.teamPayout = 0;
	this.teamMove = "";
}

var blueTeam = new Team();
var redTeam = new Team();

var teams = {
	// "blue": blueTeam,
	// "red": redTeam,
};
teams["blue"] = blueTeam;
teams["red"] = redTeam;

// player functions

function isExistingName(element, index, array) {
	return element.playerName == tempName;
}

function playerNameCheck(checkName) {
	// console.log(checkName + " name check");
	tempName = checkName;

	if (playerList.hasOwnProperty( isExistingName )) {
		// console.log(checkName + " already exists")
	} else {
		var newPlayer = new Player(tempName);
		playerList[tempName] = newPlayer;
		// console.log(newPlayer.playerName + " created");
	}
	// console.log(playerList);
}

// team functions

function updateOdds() {
	blueTeam.teamPayout = redTeam.teamGold / blueTeam.teamGold;
	redTeam.teamPayout = blueTeam.teamGold / redTeam.teamGold;
}

// ___official twitch tpp config___
var irc = require('twitch-irc');
var channel = '#twitchplayspokemon';

//configure client
var clientOptions = {
	options: {
		debug: true,
		debugIgnore: ['ping', 'chat', 'action']
	},
	channels: [channel]
};
var client = new irc.client(clientOptions);

// connect
client.connect();

// message handler
client.addListener('chat', function (channel, user, message) {
	// console.log(user.username + ': ' + message);
	if ( (message.search(bet_re) == 0) && (duringBetting == true) ) {
		tempName = user.username;
		tempMsg = message.replace(bet_re, '');
		
		playerNameCheck(tempName);
		
		if (tempMsg.search(team_re) >= 0) {
			tempTeam = tempMsg.toLowerCase().match(team_re);
			tempMsg = message.replace(tempTeam, '');

			if (tempMsg.search(commaDigit_re) >= 0) {
				tempBet = tempMsg.match(commaDigit_re);
				tempBet = parseInt( (" "+tempBet).replace(",", "") );
				

				playerList[tempName].playerBet = tempBet;

				console.log(tempName + " bet " + playerList[tempName].playerBet + " dongers on " + tempTeam);
				
				teams[tempTeam].teamGold += tempBet;
				console.log(tempTeam + " team total: " + teams[tempTeam].teamGold)
				updateOdds;
				console.log("new odds: " + (blueTeam.teamGold / redTeam.teamGold));
			}
		}
	} else
	if (user.username == "tppinfobot") {
		console.log("tppinfobot: " + message);

		if (message.search("A new match is about to begin!") >= 0) {
			duringBetting = true;
			console.log("Betting period opened");
		} else
		if ( (message.search("The battle between") >= 0) && (message.search("has just begun!") > 0) ) {
			duringBattle = true;
			duringBetting = false;
			console.log("Battle has begun");
		} else
		if (message.search(" won the match") > 0) {
			duringBattle = false;
			tempTeam = message.match(team_re);
			for (var i = 0; i < playerList.length; i++) {
				var player = playerList[i];
				if (player.playerTeam == tempTeam) {
					player.playerGold += player.playerBet * tempTeam.teamPayout;
				} else
				if (player.playerTeam){
					player.playerGold -= player.playerBet;
				}
				player.playerBet = 0;
				player.playerTeam = "";
				updateOdds;
			};
		}

	} else
	if (user.username == "tppbankbot") {
		console.log("tppbankbot: " + message);

		if ( (message.search(username_re) == 0) && (message.search(" your balance is ") > 0) ) {
			// "@username your balance is 2,345,678"

			// console.log("balance statement");
			// tempName = username_re.exec(message)[0];
			tempName = message.match(username_re)[0];
			tempMsg = message.replace(tempName, '');
			
			tempName = tempName.substr(1);

			// tempGold = commaDigit_re.exec( message.substr(username_re.exec(message).lastIndex) )[0];
			tempGold = tempMsg.match(commaDigit_re);

			playerNameCheck(tempName);

			playerList[tempName].playerGold = parseInt((" "+tempGold).replace(",", ""));
			playerList[tempName].playerGoldString = tempGold;
			
			console.log( tempName + " " + tempGold );
			// message.search(username_re)
		}
	}
});


// ___server stuff; add later___
// http.createServer(function (req, res) {
// 	res.writeHead(200, {'Content-Type': 'text/plain'});
// 	res.end('Hello World, you said X: '+ x +' times.\n');
// }).listen(1337, '127.0.0.1');


