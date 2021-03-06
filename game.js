var host;
switch(window.location.protocol) {
case 'http:':
case 'https:':
    host = location.origin.replace(/^http/, 'ws');
    break;
case 'file:':
    host = "ws://127.0.0.1:5000";
    break;
default:
    host = "ws://127.0.0.1:5000";
}

var ws;
var user={};

var Game = {
	
	main: function() {
		ws = Game.webSocketConnect();
		ws.onmessage = function (event) {

			var responseObject = JSON.parse(event.data);

			console.log("[Message Received] Command : " + responseObject.command + " Param : " + responseObject.param);

			//Command Controller
			if(responseObject.command == CMD.START) {

				Game.processStart(responseObject.param);

			}else if(responseObject.command == CMD.TURN) {

				Game.processTurn(responseObject.param);

			}else if(responseObject.command == CMD.ROLLBACK) {

				Game.processRollback(responseObject.param);

			}else if(responseObject.command == CMD.PENALTY) {

				Game.processPenalty(responseObject.param);

			}else if(responseObject.command == CMD.EXIT) {

				Game.processExit();

			}else if(responseObject.command == CMD.WIN) {

				Game.processWin(responseObject.param);

			}else if(responseObject.command == CMD.DISCONNECT) {

				Game.processDisconnect(responseObject.param);

			}else if(responseObject.command == CMD.INFO) {

				Game.processInfo(responseObject.param);

			}else if(responseObject.command == CMD.PRIVATE_INFO) {

				Game.processPrivateInfo(responseObject.param);

			}else if(responseObject.command == CMD.SYNC) {

				Game.processSync(responseObject.param);

			}else if(responseObject.command == CMD.CHAT) {

				Game.processChat(responseObject.param);

      }else if(responseObject.command == CMD.TIMER) {

        Game.processTimer(responseObject.param);
			}else {
				// nothing happen
			}
		}

		//Button Event Register
		Game.registerButtonEvent();

		//Initialize Board
		Game.makeBoard("#"+BOARD.GAME_BOARD_ID, BOARD.WIDTH, BOARD.HEIGHT);
		Game.makeBoard("#"+BOARD.OWN_BOARD_ID, BOARD.OWN_WIDTH, BOARD.OWN_HEIGHT);

		//Setting Intro Tiles
		Game.introBoard();

		//REDIPS Initialize
		Redips.initialize();

	},

	registerButtonEvent: function() {

		$( "#sendBtn" ).click(function() {
			Game.sendMessage(ws);
		});    

		$( "#messageBtn" ).click(function() {
			$( "#floatingMessage" ).toggle();
		});

		//keyboard
		$( "#msg" ).keypress(function(e) {
			if(e.keyCode == 13) {
				Game.sendMessage(ws);
			}
		});

		Game.bindGameStartButtonEvent();

		$( "#dialog" ).click(function() {
			$(this).dialog('close');
		});
	},

	bindGameStartButtonEvent: function() {
		$( "#gameBtn").unbind( "click" );
		$( "#gameBtn").html(MESSAGE.MSG_BTN_START);
		$( "#gameBtn" ).click(function() {
			Game.startGame(ws);
		});
	},

	bindTurnButtonEvent: function() {
		$( "#gameBtn").unbind( "click" );
		$( "#gameBtn").html(MESSAGE.MSG_BTN_NEXT_TURN);
		$( "#gameBtn" ).click(function() {
			Game.nextTurn(ws, false); //isTimeout false
		});
	},

	webSocketConnect: function() {
		//Websocket Instance
		return new WebSocket(host);
	},

	syncBoard: function() {
		var boardSerializeMap = Game.serializeTable("#"+BOARD.GAME_BOARD_ID);
		var requestObject = UTIL.makeCommand(CMD.SYNC, boardSerializeMap);

		console.log("REQUEST CMD : " + requestObject.command);
		console.log("REQUEST PARAM : " + requestObject.param);
		ws.send(JSON.stringify(requestObject));
	},

	sendMessage: function(ws) {
		var messageValue = $( "#msg" ).val();
		ws.send(JSON.stringify( UTIL.makeCommand( CMD.CHAT, messageValue) ));
		$( "#msg" ).val("");
	},

	startGame: function(ws) {
		ws.send(JSON.stringify( UTIL.makeCommand(CMD.START) ));
	},

	nextTurn: function(ws, isTimeout) {
		var boardSerializeMap = Game.serializeTable("#"+BOARD.GAME_BOARD_ID);
		var param = {};
		param.board = boardSerializeMap;
		param.isTimeout = isTimeout;

		ws.send(JSON.stringify( UTIL.makeCommand(CMD.TURN, param) ));
	},

	processStart: function(param) {
		Game.clearBoard("#"+BOARD.GAME_BOARD_ID);
		for(var idx in param.own) {
			var i = Math.floor(idx/BOARD.WIDTH);
			var j = idx%BOARD.WIDTH;
			Game.settingTile("#"+BOARD.OWN_BOARD_ID, param.own[idx], i, j);
		}
		Game.bindTurnButtonEvent();
	},

	processTurn: function(param) {
		var tbl = $("table" + "#" + BOARD.GAME_BOARD_ID + " tr").map(function() {
			return $(this).find('td').map(function() {
				if ($(this).html() != "") {
					var tileId = $(this).children("div").attr("id");
					if (tileId.split("_")[0] == "own") {
						$(this).children("div").attr("id", tileId.replace("own", "game"));
					}
				}
			}).get();
		}).get();
	},

	processRollback: function(params) {
		for(var idx in params) {
			var position = Game.getEmptySpaceTablePosition("#"+BOARD.OWN_BOARD_ID, BOARD.OWN_WIDTH, BOARD.OWN_HEIGHT);
			params[idx].isOwn = true;
			Game.settingTile("#"+BOARD.OWN_BOARD_ID, params[idx], position.i, position.j);
		}		
	},

	processPenalty: function(params) {

		//dialog message
		var html = "";
		html += "<p>"+ UTIL.getMessage(MESSAGE.MSG_PENALTY, user.id, params.length)+"</p>"
		html += "<span>"
		for(var idx in params) {
			if(params[idx].isJoker) {
				html += "<div class=\"card\"><span class=\"jo_eye\"></span><span class=\"jo_eye\"></span><span class=\"jo_mouth circle\"></span></div>";
			}else {
				html += "<div class=\"card\"><span class=\""+params[idx].color+" circle\">"+params[idx].score+"</span></div>";
			}
		}
		html += "</span>"

		Game.openDialog(html, function() {
			//setting tiles  
			for(var idx in params) {
				var position = Game.getEmptySpaceTablePosition("#"+BOARD.OWN_BOARD_ID, BOARD.OWN_WIDTH, BOARD.OWN_HEIGHT);
				params[idx].isOwn = true;
				Game.settingTile("#"+BOARD.OWN_BOARD_ID, params[idx], position.i, position.j);
			}
		}, true);
		
	},

	processExit: function() {

		Game.clearBoard("#"+BOARD.GAME_BOARD_ID);
		Game.clearBoard("#"+BOARD.OWN_BOARD_ID);
		Game.introBoard();
		$( "#gameBtn" ).attr("disabled", false);

		Game.bindGameStartButtonEvent();

	},

	processWin: function(params) {

		var html = "";
		var winHtml = "";
		for(var idx in params) {

			if(params[idx].isWin) {
				winHtml += "<p>"+ UTIL.getMessage(MESSAGE.MSG_WIN, params[idx].id) +" </p>"; 
			}

			html += "<p>"+ params[idx].id + " score : " + params[idx].score + "</p>";        
		}
		Game.openDialog(winHtml + html, null, false);
		$("#sandGlass").html("");

		$( "#gameBtn" ).attr("disabled", false);
		Game.bindGameStartButtonEvent();

	},  

	processDisconnect: function(param) {
		var html = "<p>"+ UTIL.getMessage(MESSAGE.MSG_DISCONNECT, param) +" </p>";
		html += "<p>"+ UTIL.getMessage(MESSAGE.MSG_EXIT) +" </p>"
		Game.openDialog(html, null, false);
		$("#sandGlass").html("");
	},

	processInfo: function(param) {

		$( "#usersInfo" ).html(UTIL.getMessage(MESSAGE.MSG_CLIENT_COUNT, param.usersInfo.length));
		$( "#usersInfo" ).attr("title", Game.makeUserInfo(param));
		$( "#usersInfo" ).tooltip();

		if(param.gamePlayingFlag == true ) {
			$( "#gamePlaying" ).html(MESSAGE.MSG_GAME_PLAYING);
			$( "#turnCount" ).html(UTIL.getMessage(MESSAGE.MSG_TURN_COUNT, param.turnCount));
		}else {
			$( "#gamePlaying" ).html(MESSAGE.MSG_GAME_READY);
			$( "#turnCount" ).empty();
		}

		// Active / Deactive start button
		if (param.usersInfo.length > 1 && param.gamePlayingFlag == false) {
			$( "#gameBtn" ).attr("disabled", false);
		}else {
			$( "#gameBtn" ).attr("disabled", true);
		}

		if (param.gamePlayingFlag == true ) {
			user.myturn = (user.id == param.currentPlayerID);
			// Active / Deactive turn button
			if (user.id == param.currentPlayerID && param.gamePlayingFlag == true) {
				$( "#gameBtn" ).attr("disabled", false);
				Redips.enableDrag(BOARD.GAME_BOARD_ID, true);
				Redips.enableDrag(BOARD.OWN_BOARD_ID, true);
			} else {
				$( "#gameBtn" ).attr("disabled", true);
				Redips.enableDrag(BOARD.GAME_BOARD_ID, false);
				Redips.enableDrag(BOARD.OWN_BOARD_ID, true);
				// Redips.enableDrag(BOARD.OWN_BOARD_ID, false);
			}
		}
	},

	processPrivateInfo: function(param) {
		user.id = param.id;
		user.registerYN = param.registerYN;
		user.use = param.use;
		user.own = param.own;

		$( "#myInfo" ).html(UTIL.getMessage(MESSAGE.MSG_MY_INFO, user.id));

	},

	processSync: function(params) {
		Game.clearBoard("#" + BOARD.GAME_BOARD_ID);
		for (var i = 0; i < BOARD.HEIGHT; i++) {
			for (var j = 0; j < BOARD.WIDTH; j++) {
				var tile = params[(i * BOARD.WIDTH) + j];
				if (tile != null) {
					Game.settingTile("#" + BOARD.GAME_BOARD_ID, tile, i, j);
				}
			}
		}
	},

	processChat: function(message) {

		if (message instanceof Object) {
			$("#messages").append("<p style='color:" + message.color + "'>" + message.text + "</p>");
		}else{
			$("#messages").append("<p style='color:" + BOARD.MESSAGE_COLOR + "'>" + message + "</p>");
		}

		$("#messages").scrollTop($("#messages")[0].scrollHeight);
	},

	settingTile: function(id,tile,x,y) {
		var tileHtml = "";
		var cardID = "";

		if("#" + BOARD.OWN_BOARD_ID == id || tile.isOwn == true){
			cardID = "own_"+UTIL.random4digit();
			Redips.mark(cardID);

		}else{
			cardID = "game_"+UTIL.random4digit();
		}

		if(tile.isJoker) {
			tileHtml = "<div class=\"card redips-drag\" id=\""+cardID+"\" ><span class=\"jo_eye\"></span><span class=\"jo_eye\"></span><span class=\"jo_mouth circle\"></span></div>";
		}else {
			tileHtml = "<div class=\"card redips-drag\" id=\""+cardID+"\" ><span class=\""+tile.color+" circle\">"+tile.score+"</span></div>";
		}

		this.settingTileHtml(id,tileHtml,x,y);
	},

	settingTileHtml: function(id,tileHtml,x,y) { 
		$(id+" tr:eq("+x+") td:eq("+y+")").html(tileHtml);
	},

	makeUserInfo: function(param){
		
		var html = "";
		for(var idx in param.usersInfo) {

			html += param.usersInfo[idx].id;
			html += " ";

			if(param.gamePlayingFlag) {

				if(param.usersInfo[idx].registerYN) {
					html += UTIL.getMessage(MESSAGE.MSG_REGISTER);
					html += " ";
				}else {
					html += UTIL.getMessage(MESSAGE.MSG_UNREGISTER);
					html += " ";
				}

				html += UTIL.getMessage(MESSAGE.MSG_REMAIN_TILES, param.usersInfo[idx].own.length);
			}

			html += ", ";

		}

		//remove last 2 character
		html = html.slice(0, -2);

		return html;
	},

	makeBoard: function(id,x,y){
		var talbeHtml = "";

		for(i=0; i<y; i++) {
			talbeHtml += "<tr>";
			for(j=0; j<x; j++) {
			
				if("#"+BOARD.OWN_BOARD_ID == id){
					talbeHtml += "<td class=\"redips-mark\">";
				}else {
					talbeHtml += "<td>";
				}
				talbeHtml += "</td>";
			}
			talbeHtml += "</tr>";
		}

		$(id).html(talbeHtml);
	},

	serializeTable: function(id) {

		var tableObj = new Array();

		var tbl = $("table"+id+ " tr").map(function() {
			return $(this).find('td').map(function() {

				if($(this).html() == "") {
					tableObj.push(null);
				} else {

					var isJoker = false;
					var isOwn = false;
					if($(this).children("div").attr("id").split("_")[0] == "own") {
						isOwn = true;
					}

					if($(this).children("div").children("span").html() == "") {
						isJoker = true;
						var tile = new Tile("30", "red", isJoker, isOwn);
						tableObj.push(tile);
					}else {
						var score = $(this).children("div").children("span").html();
						var color = $(this).children("div").children("span").attr("class").replace(" circle","");
						var tile = new Tile(score, color, isJoker, isOwn);
						tableObj.push(tile);
					}

				}

			}).get();
		}).get();

		return tableObj;
	},

	getEmptySpaceTablePosition: function(id, targetTableWidth, targetTableHeight) {

		var position = {};
		var serializeMap = Game.serializeTable(id);

		for(var i=0; i<targetTableHeight; i++) {
			for(var j=0; j<targetTableWidth; j++) {
				var tile = serializeMap[(i*targetTableWidth)+j];


				if(tile == null) {
					position.i = i;
					position.j = j;
					return position;
				}
				
			}
		}

	},

	introBoard: function() {

		var standX = Number(2);
		var standY = Number(7);

		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("R", "red", false), standX, standY);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("u", "red", false), standX, standY+1);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("m", "red", false), standX, standY+2);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("m", "red", false), standX, standY+3);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("y", "red", false), standX, standY+4);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("-", "red", false), standX, standY+5);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("O", "red", false), standX, standY+6);
		Game.settingTile("#"+BOARD.GAME_BOARD_ID, new Tile("30", "red", true), standX, standY+7);
	},

	clearBoard: function(id) {

		for(var i=0; i<BOARD.HEIGHT; i++) {
			for(var j=0; j<BOARD.WIDTH; j++) {
				Game.settingTileHtml(id, "", i, j);
			}
		}

	},

	openDialog: function(html, callback, timeout) {
		$("#dialog").dialog({
			close: callback,
      open: function(event, ui){
        if(timeout) {
          setTimeout("$('#dialog').dialog('close')", BOARD.DIALOG_TIMEOUT);
        }
      }
		});
		$("#dialog").html(html);
	},

	processTimer: function(param) {

		var sec = param.sec;
		var currentPlayerID = param.currentPlayerID;

		if (sec == 0) {
			$("#sandGlass").html("");
			if (currentPlayerID == user.id) {
				Game.nextTurn(ws, true); //isTimeout true
			}
		} else if (sec < BOARD.TIMER_LIMIT && sec > 0) {
			$("#sandGlass").html("<span class=\"alert\">" + UTIL.getMessage(MESSAGE.MSG_TIMER, Number(sec)) + "</span>");
		} else {
			$("#sandGlass").html(UTIL.getMessage(MESSAGE.MSG_TIMER, Number(sec)));
		}		
	}
};

function isMyTurn(user) {
	return user.myturn ? true : false;
}

var Redips = {
	initialize: function() {
		
		REDIPS.drag.dropMode = "single";
		REDIPS.drag.hover.colorTd = "";

		//REDIPS Dropped Event
		REDIPS.drag.event.dropped = function () {
			if (isMyTurn(user)) {
				Game.syncBoard();
			}
		};
	},

	enableDrag: function(cssName, isEnable) {
		REDIPS.drag.init();
		REDIPS.drag.enableTable(isEnable, cssName);
	},

	mark: function(id) {
		REDIPS.drag.mark.exception[id] = "mark";
	}

};
