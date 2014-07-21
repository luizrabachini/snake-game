/**
 * Snake Game
 *
 * Plugin to add a secret snake game in html pages using canvas
 *
 * author: Luiz Paulo rabachini <luiz.rabachini@gmail.com>
 */

SnakeGame = function() {
	var snake,
		grid;

	var LEFT_CODE = 37,
		UP_CODE = 38,
		RIGHT_CODE = 39,
		DOWN_CODE = 40,
		A_CODE = 66,
		B_CODE = 65;

	var snakeCurrentCode = [],
		// Easter egg (Konami Code): Up Up Down Down Left Right Left Right b a
		snakeCode = [UP_CODE, UP_CODE, DOWN_CODE, DOWN_CODE, LEFT_CODE, RIGHT_CODE, LEFT_CODE, RIGHT_CODE, A_CODE, B_CODE];

	var snakeGameConfig = {
			cellSize:10,					// Size of grid cells
			cellPadding:1,					// Padding of grid cell (must be less than cellSize / 2)
			initialLen:5,					// Initial len of snake (number of initial nodes)
			moveInterval:20,				// Interval between snake movements (in milliseconds)
			nodeColor:'rgba(0, 0, 0, 0.3)'	// Color of snake nodes
		};

	var animFrame,
		animRequestId;

	var gameCanvas;

	// ----- Load and configuration -----

	function initSnakeGame(gameConfig) {
		document.onreadystatechange = function () {
			if (document.readyState == 'complete') {
				document.addEventListener('keydown', onKeyDown, false);
				configSnakeGame(gameConfig);
				loadResources();
			}
		}
	}

	function configSnakeGame(gameConfig) {
		if (gameConfig !== undefined) {
			for (key in gameConfig) {
				snakeGameConfig[key] = gameConfig[key];
			}
		}
	}

	function loadResources() {
		gameCanvas = document.createElement('snake-game-canvas');

		if (gameCanvas != null) {
			gameCanvas = document.createElement('canvas');
			gameCanvas.id = 'snake-game-canvas';

			gameCanvas.width = window.innerWidth;
			gameCanvas.height = window.innerHeight;
			
			gameCanvas.style.position = 'absolute';
			gameCanvas.style.zIndex = 0;
			gameCanvas.style.margin = 0;

			// Add canvas in the body
			document.body.insertBefore(gameCanvas, document.body.childNodes[0]);
		}

		animFrame = window.requestAnimationFrame ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function(callback){
						window.setTimeout(callback, 1000 / 60);
					};

		grid = new Grid(gameCanvas, snakeGameConfig.cellSize, snakeGameConfig.cellPadding);
		snake = new Snake(grid, snakeGameConfig.initialLen, snakeGameConfig.moveInterval);
	}

	// ----- Rendering -----

	function render() {
		if (snake.started) {
			snake.move();
			animRequestId = animFrame(render);
		} else {
			grid.clearGrid();
		}
	}

	// ----- Controls -----

	function startSnakeGame() {
		snake.start();
		animRequestId = animFrame(render);
	}

	function stopSnakeGame() {
		snake.stop();
		grid.clearGrid();	
		snakeCurrentCode = [];
		window.cancelAnimationFrame(animRequestId);
	}

	function destroySnakeGame() {
		if (snake !== undefined && grid !== undefined) {
			stopSnakeGame();
		}
		document.body.removeChild(gameCanvas);
		document.removeEventListener('keydown', onKeyDown, false);		
	}

	function onKeyDown(event) {
		keyCode = event.keyCode;

		if (keyCode == 27) {
			stopSnakeGame();
		} else if (snake.started) {
			snake.changeDirection(keyCode, true);
		} else {
			snakeCurrentCode.push(keyCode);
			verifyCode();
		}
	}

	// ----- Easter egg verification -----

	function verifyCode() {
		if (!snake.started && equalsArray(snakeCode, snakeCurrentCode)) {
			startSnakeGame();
		} else if (snakeCode.length == snakeCurrentCode.length) {
			stopSnakeGame();
		}
	}

	function equalsArray(a1, a2) {
		if (a1 === a2) return true;
		if (a1 === undefined || a2 === undefined || a1.length != a2.length) return false;

		for (i = 0; i < a1.length; i++) {
			if (a1[i] !== a2[i]) return false;
		}

		return true;
	}

	function getRandom(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	// -----

	function Snake(grid, len, interval) {
		var grid = grid,
			nodes = [],
			newNode,
			initialLen = len,
			direction = 0,
			dimensions = grid.getDimension(),
			incX = 0,
			incY = 0,
			firstDisplay = true,
			moveInterval = interval,
			lastMoveTime;
		this.started = false;

		this.create = function() {
			// Start snake in the middle of canvas
			startPx = Math.floor(dimensions[0] / 2);
			startPy = Math.floor(dimensions[1] / 2);

			randDirection = getRandom(LEFT_CODE, DOWN_CODE);
			nodes = [];

			this.changeDirection(randDirection, false);

			// Head
			nodes.push([startPx, startPy]);

			// Body
			for (i = 0; i < initialLen; i++) {
				startPx -= incX;
				startPy -= incY;
				nodes.push([startPx, startPy]);
			}

			this.createNewNode();
		}

		this.move = function() {
			currentTime = Date.now();
			
			if (!this.started || (currentTime - lastMoveTime) < moveInterval) {
				return;
			}

			lastMoveTime = currentTime;

			newHead = [nodes[0][0] + incX, nodes[0][1] + incY];

			nodes.unshift(newHead);
			lastNode = nodes.pop();

			if (firstDisplay) {
				firstDisplay = false;
				grid.clearGrid();

				for (i = 0; i < nodes.length; i++) {
					node = nodes[i];
					grid.drawNode(node);
				}
				grid.drawNode(newNode);
			} else {
				grid.clearNode(lastNode);
				grid.drawNode(newHead);
			}

			this.checkColision();
			this.checkNewNode();
		}

		this.checkColision = function() {
			head = nodes[0];

			// Out of canvas
			if (head[0] > dimensions[0] || head[0] < 0 ||
				head[1] > dimensions[1] || head[1] < 0) {
				stopSnakeGame();
			}

			// Internal colision
			for (i = 1; i < nodes.length; i++) {
				if (head[0] == nodes[i][0] && head[1] == nodes[i][1]) {
					stopSnakeGame();
				}
			}
		}

		this.createNewNode = function() {
			newNodeX = getRandom(0, dimensions[0] - 1);
			newNodeY = getRandom(0, dimensions[1] - 1);
			newNode = [newNodeX, newNodeY];
		}

		this.checkNewNode = function() {
			head = nodes[0];
			if (head[0] == newNode[0] && head[1] == newNode[1]) {
				nodes.unshift(newNode);
				this.createNewNode();
				grid.drawNode(newNode);
			}
		}

		this.changeDirection = function(newDirection, validate) {
			switch(newDirection) {
				case LEFT_CODE:
					if (validate) {
						if (direction != RIGHT_CODE) {
							direction = LEFT_CODE;
							incX = -1;
							incY = 0;
						}
					} else {
						direction = LEFT_CODE;
						incX = -1;
						incY = 0;
					}					
					break;
				case UP_CODE:
					if (validate) {
						if (direction != DOWN_CODE) {
							direction = UP_CODE;
							incX = 0;
							incY = -1;
						}											
					} else {
						direction = UP_CODE;
						incX = 0;
						incY = -1;
					}
					break;
				case RIGHT_CODE:
					if (validate) {
						if (direction != LEFT_CODE) {
							direction = RIGHT_CODE;
							incX = 1;
							incY = 0;
						}										
					} else {
						direction = RIGHT_CODE;
						incX = 1;
						incY = 0;
					}					
					break;
				case DOWN_CODE:
					if (validate) {
						if (direction != UP_CODE) {
							direction = DOWN_CODE;
							incX = 0;
							incY = 1;
						}						
					} else {
						direction = DOWN_CODE;
						incX = 0;
						incY = 1;
					}					
					break;
			}
		}

		this.start = function() {
			lastMoveTime = Date.now();
			this.create();
			this.started = true;
			firstDisplay = true;
		}

		this.stop = function() {
			this.started = false;
		}
	}


	function Grid(canvas, cellSize, cellPadding) {
		var canvas = canvas;

		var cellPadding = cellPadding;
		var cellSize = cellSize;
		var nColumns = Math.floor(canvas.width / cellSize);
		var nRows = Math.floor(canvas.height / cellSize);
		
		var context = canvas.getContext('2d');
		var startArcPoint = (Math.PI/180) * 0;
		var endArcPoint = (Math.PI/180) * 360;

		context.fillStyle = snakeGameConfig.nodeColor;
		canvas.style.marginRight = canvas.style.marginLeft =
			(canvas.width - nColumns * cellSize) / 2;
		canvas.style.marginTop = canvas.style.marginBottom = 
			(canvas.height - nRows * cellSize) / 2;

		this.drawNode = function(node) {
			px = Math.floor((node[0] * cellSize) + (cellSize / 2));
			py = Math.floor((node[1] * cellSize) + (cellSize / 2));
			context.beginPath();
			context.arc(px, py,
				cellSize / 2 - cellPadding,
				startArcPoint, endArcPoint, true);
			context.fill();
		}

		this.clearNode = function(node) {
			px = Math.floor(node[0] * cellSize);
			py = Math.floor(node[1] * cellSize);
			context.clearRect(px, py, cellSize, cellSize);
		};

		this.clearGrid = function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
		};

		this.getDimension = function() {
			return [nColumns, nRows];
		};
	}

	return {
		init:initSnakeGame,
		destroy:destroySnakeGame
	}
};