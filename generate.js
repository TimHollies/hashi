
function GenerateBoard(width, height, twoToOneRatio) {

	if(twoToOneRatio === undefined)twoToOneRatio = 2;

	var boardSize = width * height;

	var board = Array.apply(null, new Array(boardSize)).map(Number.prototype.valueOf,0);

	var highlightedNodes = [];

	var rand = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	};

	var numberOfNodes = rand(20,35);

	var getRandomItem = function(list, weight) {
		var total_weight = weight.reduce(function (prev, cur, i, arr) {
			return prev + cur;
		});

		var random_num = rand(0, total_weight);
		var weight_sum = 0;

		for (var i = 0; i < list.length; i++) {
			weight_sum += weight[i];
			weight_sum = +weight_sum.toFixed(2);

			if (random_num <= weight_sum) {
				return list[i];
			}
		}
	}

	var selectRandomNode = function(nodes) {
		/*var totalArity = _.sum(_.pluck(nodes, "arity"));
		var selectedValue = Math.floor((Math.random() * totalArity));

		var testArity = 0;
		for(var i = 0; i < nodes.length; i++) {
			testArity += nodes[i].arity;
			if(testArity >= selectedValue) return nodes[i];
		}*/
	    return _.sample(nodes);
	};

	var getCrossSection = function(loc) {
		var rowStart = Math.floor(loc/width) * width;
		//return _.union(_.range(rowStart, rowStart+width), _.range(loc%width, loc%width + boardSize, width));
	
		var output = [];

		for(var i = loc + 1; i<rowStart + width; i++) {
			if(board[i] === 0) {
				output.push(i);
			} else {
				break;
			}
		}
		
		for(var i = loc - 1; i>=rowStart; i--) {
			if(board[i] === 0) {
				output.push(i);
			} else {
				break;
			}
		}

		for(var i = loc + width; i<boardSize; i+=width) {
			if(board[i] === 0) {
				output.push(i);
			} else {
				break;
			}
		}
		
		for(var i = loc - width; i>0; i-=width) {
			if(board[i] === 0) {
				output.push(i);
			} else {
				break;
			}
		}

		return output;
	}

	var getCollisions = function(loc) {
		var rowStart = Math.floor(loc/width) * width;
		var output = [];

		for(var i = loc + 1; i<rowStart + width; i++) {
			if(board[i] > 0) {
				output.push(i);
				break;
			}
		}
		
		for(var i = loc - 1; i>=rowStart; i--) {
			if(board[i] > 0) {
				output.push(i);
				break;
			}
		}

		for(var i = loc + width; i<boardSize; i+=width) {
			if(board[i] > 0) {
				output.push(i);
				break;
			}
		}
		
		for(var i = loc - width; i>0; i-=width) {
			if(board[i] > 0) {
				output.push(i);
				break;
			}
		}

		return output;
	}

	var startLocation = Math.floor((Math.random() * boardSize));

	var startNode = {
		loc: startLocation,
		arity: 5,
		connections: 0
	};

	highlightedNodes.push(startNode);
	board[startLocation] = 1;

	function addNewNode() {

		var foundValidNode = false;
		var nodesToLine = [];
		var newCircle;

		var nodeToBuildOf;

		var noMoreRoom = false;

		var tries = 0;

		while(!foundValidNode) {

			foundValidNode = true;

			nodeToBuildOf = selectRandomNode(highlightedNodes);			


			var possibleLocations = getCrossSection(nodeToBuildOf.loc);

			var filteredLocations = possibleLocations.filter(function(loc) {

				var clean = true;

				if(board[loc] !== 0) clean = false;
				if(board[loc + 1] > 0) clean = false;
				if(board[loc - 1] > 0) clean = false;
				if(board[loc + width] > 0) clean = false;
				if(board[loc - width] > 0) clean = false;

				return clean;
			});

			if(filteredLocations.length === 0) {
				tries ++;
				foundValidNode = false;
				if(tries > 1000) {
					noMoreRoom = true;
					break;
				}
				continue;
			}

			var weights = filteredLocations.map(function(loc){
				return 1;
			});

			newCircle = getRandomItem(filteredLocations, weights);

			if(newCircle === undefined) {
				console.error("NEW CIRLCE IS UNDEFINED")
			}

			nodesToLine = [];

			if(Math.floor(nodeToBuildOf.loc / width) === Math.floor(newCircle / width)) {
				if(nodeToBuildOf.loc < newCircle) {
					nodesToLine = _.range(nodeToBuildOf.loc+1, newCircle);
				} else {
					nodesToLine = _.range(newCircle+1, nodeToBuildOf.loc);
				}
			} else {
				if(nodeToBuildOf.loc < newCircle) {
					nodesToLine = _.range(nodeToBuildOf.loc + width, newCircle, width);
				} else {
					nodesToLine = _.range(newCircle + width, nodeToBuildOf.loc, width);
				}
			}

		}

		if(noMoreRoom) {
			return false;
		}

		nodesToLine.forEach(function(i) {
			board[i] = -1;
		});

	    nodeToBuildOf.arity -= 1;	

	    var lineWeight = (rand(1, twoToOneRatio) === 1) ? 1 : 2;//_.sample([1,2]);
	    nodeToBuildOf.connections += lineWeight;

	    if(newCircle === undefined) {
	    	console.error("NEW CIRCLE IS UNDEFINED")
	    }

	    highlightedNodes.push({
	    	loc: newCircle,
	    	arity: 4,
	    	connections: lineWeight
	    });

	    board[newCircle] = highlightedNodes.length;

	    return true;
	}	

	var outputBoard = function(b) {
		return b.map(function(a) {
			if(a <= 0) return 0;
			return highlightedNodes[a-1].connections;
		});
	};

	while(addNewNode() && highlightedNodes.length <= numberOfNodes) {}

	return outputBoard(board);
}