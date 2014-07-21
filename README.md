Snake Game
==========

Plugin to add a secret snake game in html pages using canvas.

The game is activated by [Konami Code](http://en.wikipedia.org/wiki/Konami_Code).

Live demo available in [luizrabachini.com](http://luizrabachini.com/)


Usage
-----

```html
<script src="snake-game-min.js"></script>
<script>
	snakeGame = new SnakeGame();
	snakeGame.init();
</script>
```

Customization
-------------

```js
config = {
	cellSize:10, // Size of grid cells
	cellPadding:1, // Padding of grid cell (must be less than cellSize / 2)
	initialLen:5, // Initial len of snake (number of initial nodes)
	moveInterval:20, // Interval between snake movements (in ms)
	nodeColor:'rgba(0, 0, 0, 0.3)' // Color of snake nodes
};
snakeGame = new SnakeGame();
snakeGame.init(config);
```