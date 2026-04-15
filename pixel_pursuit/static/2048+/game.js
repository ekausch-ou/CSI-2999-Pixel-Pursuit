import { Board } from './board.js';
import { Tile } from './tile.js';

class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.game = new Board(5);

        this.tileSize = 60;
        this.tileGap = 5;

        this.score = 0;
        this.gameStarted = false;

        // Ball
        this.ballX = 0;
        this.ballY = 0;
        this.ballDX = 2.4;
        this.ballDY = 1.8;
        this.ballSize = 50;
        this.ballMoving = true;

        this.init();
    }

    init() {
        document.addEventListener("keydown", (e) => this.handleKey(e));
        this.canvas.addEventListener("click", (e) => this.handleClick(e));

        this.startGame();
        this.loop();
    }

    startGame() {
        this.game = new Board(5);
        this.game.spawn();
        this.game.spawn();
        this.gameStarted = true;
    }

    handleKey(e) {
        if (!this.gameStarted) return;

        let oldBoard = this.game.copyBoard();

        switch (e.key) {
            case "ArrowUp":
                this.game.up();
                break;
            case "ArrowDown":
                this.game.down();
                break;
            case "ArrowLeft":
                this.game.left();
                break;
            case "ArrowRight":
                this.game.right();
                break;
            default:
                return;
        }

        if (this.boardChanged(oldBoard)) {
            this.game.spawn();
        }
    }

    handleClick(e) {
        console.log("Mouse clicked:", e.offsetX, e.offsetY);
        // You can map clicks to tiles here like your Java version
    }

    boardChanged(oldBoard) {
        for (let i = 0; i < this.game.board.length; i++) {
            for (let j = 0; j < this.game.board[i].length; j++) {
                if (
                    this.game.board[i][j].getValue() !==
                    oldBoard[i][j].getValue()
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    updateBall() {
        if (!this.ballMoving) return;

        this.ballX += this.ballDX;
        this.ballY += this.ballDY;

        let limit = this.game.board.length * this.tileSize;

        if (this.ballX <= 0 || this.ballX + this.ballSize >= limit) {
            this.ballDX *= -1;
        }

        if (this.ballY <= 0 || this.ballY + this.ballSize >= limit) {
            this.ballDY *= -1;
        }
    }

    drawBoard() {
        let size = this.game.board.length;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let tile = this.game.board[i][j];
                let x = j * this.tileSize;
                let y = i * this.tileSize;

                this.drawTile(tile, x, y);
            }
        }
    }

    drawTile(tile, x, y) {
        let val = tile.getValue();
        let color = tile.getColor();

        this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.ctx.fillRect(x, y, this.tileSize - 5, this.tileSize - 5);

        if (val > 0) {
            this.ctx.fillStyle = val >= 128 ? "white" : "black";
            this.ctx.font = "20px monospace";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            this.ctx.fillText(
                val,
                x + this.tileSize / 2,
                y + this.tileSize / 2
            );
        }
    }

    drawBall() {
        this.ctx.fillStyle = "green";
        this.ctx.beginPath();
        this.ctx.arc(
            this.ballX + this.ballSize / 2,
            this.ballY + this.ballSize / 2,
            this.ballSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBoard();
        this.drawBall();

        this.ctx.fillStyle = "black";
        this.ctx.fillText("Score: " + this.game.getScore(), 10, 20);
    }

    loop() {
        this.updateBall();
        this.draw();

        requestAnimationFrame(() => this.loop());
    }
}

// start game
new Game();