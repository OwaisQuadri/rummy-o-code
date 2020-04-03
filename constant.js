//constant
var BOARD = {
	WIDTH : 22,
	HEIGHT : 6,
	OWN_WIDTH : 22,
	OWN_HEIGHT : 2,
	GAME_BOARD_ID : "gameBoard",
	OWN_BOARD_ID : "ownBoard",
	PENALTY_ONE : 1,
	PENALTY_THREE : 3,
	MESSAGE_COLOR : "White",
	TIMER_SEC : 60,
	TIMER_LIMIT : 10,
	TIMER_INTERVAL : 1000,
	DIALOG_TIMEOUT : 3000,
	CHAT_COLOR : ["Aqua", "Turquoise", "Yellow", "Lime", "Chartreuse", "Violet", "Gold", "Orange"],
	USER_PREFIX : "USER_"
}

var CMD = {
	CHAT : "::CHAT::",
	JOIN : "::JOIN::",
	SYNC : "::SYNC::",
	START : "::START::", 
	TURN : "::TURN::", 
	EXIT : "::EXIT::",
	INFO : "::INFO::",
	PRIVATE_INFO : "::PRIVATE_INFO::",
	PENALTY : "::PENALTY::",
	ROLLBACK : "::ROLLBACK",
	WIN : "::WIN::",
	DISCONNECT : "DISCONNECT",
	TIMER : "::TIMER::"
};

var INLINE_CMD = {
	"HELP" : "/?",
	"CHANGE_NAME" : "/name"
};

var MESSAGE = {
	MSG_BTN_START : "Start",
	MSG_BTN_NEXT_TURN : "End turn",
	MSG_START : "The game has started.<br/>======================<br/><br/>Welcome to Rummy-O. <br/>Press /? for instructions. <br/>To enter your username, enter command /name [username].<br /><br />======================<br/><br/>",
	MSG_EXIT : "The game is over.",
	MSG_TURN : "{0} You have ended your turn.",
	MSG_NEXT_TURN : "{0}'s turn.",
	MSG_JOIN : "{0} joined.",
	MSG_DISCONNECT : "{0} disconnected.",
	MSG_CLIENT_COUNT : "[{0} are online]",
	MSG_TURN_COUNT : "{0} turn count",
	MSG_GAME_READY : "Game is ready",
	MSG_GAME_PLAYING : "The game is in progress",
	MSG_MY_INFO : "Welcome {0}!",
	MSG_WIN : "{0} won! Congratulations!.",
	MSG_PENALTY : "{0} takes {1} penalty tiles.",
	MSG_REGISTER : "(register)",
	MSG_UNREGISTER : "(unregister)",
	MSG_REMAIN_TILES : "{0} tiles remaining",
	MSG_TIMER : "{0} seconds remain until end of turn.",
	MSG_HELP : "<span style=\"color:Gold;\"><br />======================<br/><br/>Rummy-O Instructions<br/><br/>There are many options to win the game. One way is to put all 3 or 4 of the same numbers with different colors, or 3 or more tiles of the same color and consecutive numbers. For the first move, you must make your first move with a group or run carrying at least 30 points in total. If it is less than 30, you have to draw a tile from the table and add it to the rack. If you don't play anything you will get 3 penalty tiles. After that you have to wait for your next move. <br/><br/>======================<br/><br/></span>",
	MSG_CHANGE_NAME : "{0} has been renamed to {1}."
};

var UTIL = {

	makeCommand: function(command, param) {
        return { 
            "command" : command, 
            "param" : param
        };
    },

	getMessage: function(msg, param0, param1) {

		if(param0 != null) {
			msg = msg.replace("{0}", param0);
		}

		if(param1 != null) {
			msg = msg.replace("{1}", param1);
		}

		return msg;
    },

    printNowDate: function() {
        now = new Date();
        year = "" + now.getFullYear();
        month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
        hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
        minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
        second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    },

    random4digit: function() {
    	return Math.floor(Math.random()*9000) + 1000;
    },

    randomChatColor: function() {
    	return BOARD.CHAT_COLOR[Math.floor(Math.random() * BOARD.CHAT_COLOR.length)];
    }

}