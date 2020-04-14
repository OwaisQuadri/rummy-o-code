//Rummikub class
function Rummikub () {
	this.scores = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
	this.colors = ['red','blue','yellow','black','red','blue','yellow','black'];
	this.tiles = [];
	this.users = [];
}

//Function to shuffle deck
Rummikub.prototype.shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

//Initializes game by gathering users
Rummikub.prototype.initializeGame = function() {
	
	this.initializeTiles();

	for(var idx in this.users) {
  		this.initializeTilesToUser(this.users[idx]);
	}
};

//Initializing tiles to user
Rummikub.prototype.initializeTiles = function() {
	
	//init
	this.tiles = [];

	for(var i in this.colors) {
		for(var j in this.scores) {
	  		this.tiles.push(new Tile(this.scores[j], this.colors[i], false));
		}
	}
	// add joker tiles
	this.tiles.push(new Tile('30', 'red', true));
	this.tiles.push(new Tile('30', 'red', true));

	this.shuffle(this.tiles);
};

//Distributes tiles to the user
Rummikub.prototype.initializeTilesToUser = function(user) {
	user.own = [];
	for(var idx=0; idx < 14; idx++) {
  		user.own.push(this.tiles.pop());
	}
};

//Function to remove users
Rummikub.prototype.removeUser = function(id) {

	var removeIndex;

	for(var idx in this.users) {
		if(id == this.users[idx].id) {
			removeIndex = idx;
			break;
		}
	}
	
	this.users.splice(removeIndex,1);
};

//Penalty tiles for the first move 
Rummikub.prototype.penaltyTile = function(numberOfPenaltyTile) {

	var penaltyTile = [];
	for(var idx=0; idx < numberOfPenaltyTile; idx++) {
  		penaltyTile.push(this.tiles.pop());
	}

	return penaltyTile;
};

//Checks if the tiles are valid for group and run
Rummikub.prototype.validateTile = function(param) {

	var group = [];
    
	for(var idx in param) {

		if(param[idx] != null) {

			group.push(param[idx]);

			if(group.length < 3) {
				continue;
			}

			console.log("\n\n\n========= group info ========");
			console.log(group);
			console.log("=============================");

			var serialNumberValidateResult = this.validateSerialNumber(group);
			var sameNumverValidateResult = this.validateSameNumber(group);

			console.log("\ncheck serialNumberValidateResult ---->  " + serialNumberValidateResult);
			console.log("check sameNumverValidateResult ----> " + sameNumverValidateResult);

			if(serialNumberValidateResult || sameNumverValidateResult) {
				//console.log("success");
				continue;
			}

		}else {

			if(group.length != 0 && group.length < 3) {
				return false;
			}
			group = [];

		}
	}

    return true;

};

//Validates the tile by the number
Rummikub.prototype.validateSerialNumber = function(param) {

	//clone param
	var group = this.clone(param);

	//Joker Logic
	for(var idx in group) {

		if(group[idx].isJoker == true) {

			if(group[Number(idx)-1] != null) {
				group[idx] = new Tile(Number(group[Number(idx)-1].score)+1, group[Number(idx)-1].color, false);
			}else {
				group[idx] = new Tile(Number(group[Number(idx)+1].score)-1, group[Number(idx)+1].color, false);
			}
			
		}

	}

	console.log("\nvalidateSerialNumber after joker");
	console.log(group);

	var colorSet = new Set();

	//Check Serial Number
	for(var idx in group) {

		if(group[Number(idx)+1] != null) {
			if(group[Number(idx)+1].score != Number(group[idx].score)+1) {
				return false;
			}else {
				colorSet.add(group[idx].color);
			}
		}

	}

	//Check Same Color
	if(colorSet.size == 1) {
		return true;
	}else {
		return false;
	}

}


//Validates the tile by the same number
Rummikub.prototype.validateSameNumber = function(param) {

	//clone param
	var group = this.clone(param);

	//Joker Logic
	for(var idx in group) {

		if(group[idx].isJoker == true) {

			if(group[Number(idx)-1] != null) {
				group[idx] = new Tile(group[Number(idx)-1].score, "colorless", false);
			}else {
				group[idx] = new Tile(group[Number(idx)+1].score, "colorless", false);
			}
			
		}

	}

	console.log("\nvalidateSameNumber after joker");
	console.log(group);

	var colorSet = new Set();
	var colorSetNotDuplicated = new Array();
	var scoreSet = new Set();

	for(var idx in group) {
		if(group[idx].color != "colorless") {
			colorSet.add(group[idx].color);
			colorSetNotDuplicated.push(group[idx].color);
		}
		scoreSet.add(group[idx].score);
	}

	//Check Same Number & Different Color
	if( colorSet.size == colorSetNotDuplicated.length && 
		scoreSet.size == 1) {
		return true;
	}else {
		return false;
	}

}

Rummikub.prototype.clone = function(obj) {

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		var copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		var copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = this.clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		var copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
};

//User class
function User (id, ownWebsocket, chatColor) {
	this.ownWebsocket = ownWebsocket; // each users websocket
	this.id = id;
	this.registerYN = false;
	this.use = [];
	this.own = [];
	this.chatColor = chatColor;
}	


User.prototype.removeOwnTile = function(tile) {

	var removeIndex;

	for(var idx in this.own) {
		if(	tile.score == this.own[idx].score &&
			tile.color == this.own[idx].color &&
			tile.isJoker == this.own[idx].isJoker) {
			removeIndex = idx;
			break;
		}
	}
	
	this.own.splice(removeIndex,1);

};

User.prototype.validateRegisterTile = function() {

	if(this.use.length < 3) {
		return false
	}
	
	var sumOfScore = 0;
	for(var idx in this.use) {
		sumOfScore += Number(this.use[idx].score);
	}

	return (sumOfScore >= 30) ? true : false;

};


User.prototype.toString = function() {
	return "id : " + this.id
		+ " registerYN : " + this.registerYN 
		+ " use : " + JSON.stringify(this.use) 
		+ " own : " + JSON.stringify(this.own);
};

//Tile class
function Tile (score, color, isJoker, isOwn) {
	this.score = score;
	this.color = color;
	this.isJoker = isJoker;
	this.isOwn = isOwn;
}
