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

    createResult() {
        return {
            moved: false,
            highlights: []
        };
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

    boardChanged(oldBoard) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].getValue() !== oldBoard[i][j].getValue()) {
                    return true;
                }
            }
        }
        return false;
    }

    // =========================
    // UP
    // =========================
    up() {
        let result = this.createResult();
        let oldBoard = this.copyBoard();

        for (let col = 0; col < this.grids; col++) {
            this.border = 0;

            for (let row = 0; row < this.grids; row++) {
                if (this.board[row][col].getValue() !== 0 && this.border <= row) {
                    this.verticalMove(row, col, "up", result);
                }
            }
        }

        result.moved = this.boardChanged(oldBoard) || result.moved;
        return result;
    }

    // =========================
    // DOWN
    // =========================
    down() {
        let result = this.createResult();
        let oldBoard = this.copyBoard();

        for (let col = 0; col < this.grids; col++) {
            this.border = this.grids - 1;

            for (let row = this.grids - 1; row >= 0; row--) {
                if (this.board[row][col].getValue() !== 0 && this.border >= row) {
                    this.verticalMove(row, col, "down", result);
                }
            }
        }

        result.moved = this.boardChanged(oldBoard) || result.moved;
        return result;
    }

    verticalMove(row, col, direction, result) {
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
                let addScore = initial.getValue() + compare.getValue();

                if (initial.getValue() !== 0) {
                    this.score += addScore;
                }

                initial.setValue(addScore);
                compare.setValue(0);

                result.highlights.push({
                    from: [row, col],
                    to: [this.border, col]
                });

                result.moved = true;
            }
        } else {
            if (direction === "down") this.border--;
            else this.border++;

            this.verticalMove(row, col, direction, result);
        }
    }

    // =========================
    // LEFT
    // =========================
    left() {
        let result = this.createResult();
        let oldBoard = this.copyBoard();

        for (let row = 0; row < this.grids; row++) {
            this.border = 0;

            for (let col = 0; col < this.grids; col++) {
                if (this.board[row][col].getValue() !== 0 && this.border <= col) {
                    this.horizontalMove(row, col, "left", result);
                }
            }
        }

        result.moved = this.boardChanged(oldBoard) || result.moved;
        return result;
    }

    // =========================
    // RIGHT
    // =========================
    right() {
        let result = this.createResult();
        let oldBoard = this.copyBoard();

        for (let row = 0; row < this.grids; row++) {
            this.border = this.grids - 1;

            for (let col = this.grids - 1; col >= 0; col--) {
                if (this.board[row][col].getValue() !== 0 && this.border >= col) {
                    this.horizontalMove(row, col, "right", result);
                }
            }
        }

        result.moved = this.boardChanged(oldBoard) || result.moved;
        return result;
    }

    horizontalMove(row, col, direction, result) {
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
                let addScore = initial.getValue() + compare.getValue();

                if (initial.getValue() !== 0) {
                    this.score += addScore;
                }

                initial.setValue(addScore);
                compare.setValue(0);

                result.highlights.push({
                    from: [row, col],
                    to: [row, this.border]
                });

                result.moved = true;
            }
        } else {
            if (direction === "right") this.border--;
            else this.border++;

            this.horizontalMove(row, col, direction, result);
        }
    }

    spawn() {
        let result = this.createResult();
        if (this.blackOut()) return;

        let empty = true;

        while (empty) {
            let row = Math.floor(Math.random() * this.grids);
            let col = Math.floor(Math.random() * this.grids);

            if (this.board[row][col].getValue() === 0) {
                this.board[row][col] =
                    new Tile(Math.random() < 0.2 ? 4 : 2);

                result.highlights.push({
                    from: null,
                    to: [row, col],
                });

                empty = false;
            }
        }
        result.moved = true;
        return result;
    }

    blackOut() {
        for (let i = 0; i < this.grids; i++) {
            for (let j = 0; j < this.grids; j++) {
                if (this.board[i][j].getValue() === 0) return false;
            }
        }
        return true;
    }

    gameOver() {
        const size = this.board.length;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const value = this.board[i][j].getValue();
                if (value === 0) return false;
                if (j < size - 1 &&
                    value === this.board[i][j + 1].getValue()) {
                    return false;
                }
                if (i < size - 1 &&
                    value === this.board[i + 1][j].getValue()) {
                    return false;
                }
            }
        }

    return true;
}

    copyBoardValues() {
        return this.board.map(row => row.map(tile => tile.getValue())
    );
}

}