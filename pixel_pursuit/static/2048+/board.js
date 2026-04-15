import { Tile } from './tile.js';

export class Board {
    constructor(grids = 4) {
        this.grids = grids;
        this.border = 0;
        this.score = 0;
        this.board = [];

        for (let i = 0; i < grids; i++) {
            this.board[i] = [];
            for (let j = 0; j < grids; j++) {
                this.board[i][j] = new Tile();
            }
        }
    }

    getBoard() {
        return this.board;
    }

    getScore() {
        return this.score;
    }

    setScore(score) {
        this.score = score;
    }

    getHighTile() {
        let high = 0;
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].getValue() > high) {
                    high = this.board[i][j].getValue();
                }
            }
        }

        return high;
    }

    spawn() {
        if (this.blackOut()) return;

        let empty = true;
        while (empty) {
            let row = Math.floor(Math.random() * this.grids);
            let col = Math.floor(Math.random() * this.grids);

            if (this.board[row][col].getValue() === 0) {
                this.board[row][col] = new Tile(Math.random() < 0.2 ? 4 : 2);
                empty = false;
            }
        }
    }

    blackOut() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].getValue() === 0) return false;
            }
        }
        return true;
    }

    gameOver() {
        let size = this.board.length;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let value = this.board[i][j].getValue();

                if (value === 0) return false;

                if (j < size - 1 && value === this.board[i][j + 1].getValue())
                    return false;

                if (i < size - 1 && value === this.board[i + 1][j].getValue())
                    return false;
            }
        }

        return true;
    }

    copyBoard() {
        let copy = [];

        for (let i = 0; i < this.board.length; i++) {
            copy[i] = [];
            for (let j = 0; j < this.board[i].length; j++) {
                copy[i][j] = new Tile(this.board[i][j].getValue());
            }
        }

        return copy;
    }

    copyBoardValues() {
        let copy = [];

        for (let i = 0; i < this.board.length; i++) {
            copy[i] = [];
            for (let j = 0; j < this.board[i].length; j++) {
                copy[i][j] = this.board[i][j].getValue();
            }
        }

        return copy;
    }

    restoreBoardValues(values) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                this.board[i][j].setValue(values[i][j]);
            }
        }
    }

    boardChanged(oldBoard) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (
                    this.board[i][j].getValue() !==
                    oldBoard[i][j].getValue()
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    up() {
        for (let i = 0; i < this.grids; i++) {
            this.border = 0;

            for (let j = 0; j < this.grids; j++) {
                if (
                    this.board[j][i].getValue() !== 0 &&
                    this.border <= j
                ) {
                    this.verticalMove(j, i, "up");
                }
            }
        }
    }

    down() {
        for (let i = 0; i < this.grids; i++) {
            this.border = this.grids - 1;

            for (let j = this.grids - 1; j >= 0; j--) {
                if (
                    this.board[j][i].getValue() !== 0 &&
                    this.border >= j
                ) {
                    this.verticalMove(j, i, "down");
                }
            }
        }
    }

    verticalMove(row, col, direction) {
        let initial = this.board[this.border][col];
        let compare = this.board[row][col];

        if (
            initial.getValue() === 0 ||
            initial.getValue() === compare.getValue()
        ) {
            if (
                row > this.border ||
                (direction === "down" && row < this.border)
            ) {
                let addScore =
                    initial.getValue() + compare.getValue();

                if (initial.getValue() !== 0)
                    this.score += addScore;

                initial.setValue(addScore);
                compare.setValue(0);
            }
        } else {
            if (direction === "down") this.border--;
            else this.border++;

            this.verticalMove(row, col, direction);
        }
    }

    left() {
        for (let i = 0; i < this.grids; i++) {
            this.border = 0;

            for (let j = 0; j < this.grids; j++) {
                if (
                    this.board[i][j].getValue() !== 0 &&
                    this.border <= j
                ) {
                    this.horizontalMove(i, j, "left");
                }
            }
        }
    }

    right() {
        for (let i = 0; i < this.grids; i++) {
            this.border = this.grids - 1;

            for (let j = this.grids - 1; j >= 0; j--) {
                if (
                    this.board[i][j].getValue() !== 0 &&
                    this.border >= j
                ) {
                    this.horizontalMove(i, j, "right");
                }
            }
        }
    }

    horizontalMove(row, col, direction) {
        let initial = this.board[row][this.border];
        let compare = this.board[row][col];

        if (
            initial.getValue() === 0 ||
            initial.getValue() === compare.getValue()
        ) {
            if (
                col > this.border ||
                (direction === "right" && col < this.border)
            ) {
                let addScore =
                    initial.getValue() + compare.getValue();

                if (initial.getValue() !== 0)
                    this.score += addScore;

                initial.setValue(addScore);
                compare.setValue(0);
            }
        } else {
            if (direction === "right") this.border--;
            else this.border++;

            this.horizontalMove(row, col, direction);
        }
    }
}