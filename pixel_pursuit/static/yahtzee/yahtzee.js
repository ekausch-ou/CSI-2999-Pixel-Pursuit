export class Yahtzee {
    constructor() {
        this.dice = new Array(5).fill(0);
        this.newGame();
    }

    newGame() {
        this.available = new Array(14).fill(1);
        this.scores = new Array(14).fill(0);
        this.resetRoll();
    }
    
    resetRoll() {
        this.rollCount = 3;
        this.dice = new Array(5).fill(0);
    }

    getCounts() {
        this.counts = new Array(6).fill(0);
        for (let die of this.dice) {
            if (die > 0) this.counts[die - 1]++;
        }
    }

    scoreDice(index) {
        if (this.available[index] === 0) return;

        this.available[index]--;

        // Yahtzee bonus
        if (this.isYahtzee() && this.scores[12] === 50) {
            this.scores[13] += 100;
        }

        if (index >= 0 && index <= 5) {
            this.getCounts();
            this.scores[index] = this.counts[index] * (index + 1);
        }

        else if (index === 6 && this.isThreeOfAKind()) {
            this.scores[index] = this.dice.reduce((a, b) => a + b, 0);
        }

        else if (index === 7 && this.isFourOfAKind()) {
            this.scores[index] = this.dice.reduce((a, b) => a + b, 0);
        }

        else if (index === 8 && this.isFullHouse()) {
            this.scores[index] = 25;
        }

        else if (index === 9 && this.isSmallStraight()) {
            this.scores[index] = 30;
        }

        else if (index === 10 && this.isLargeStraight()) {
            this.scores[index] = 40;
        }

        else if (index === 11) {
            this.scores[index] = this.dice.reduce((a, b) => a + b, 0);
        }

        else if (index === 12 && this.isYahtzee()) {
            this.scores[index] = 50;
        }
    }
    
    getUpperScore() {
        return this.scores.slice(0, 6).reduce((a, b) => a + b, 0);
    }

    getLowerScore() {
        return this.scores.slice(6, 14).reduce((a, b) => a + b, 0);
    }

    isYahtzee() {
        this.getCounts();
        return this.counts.includes(5);
    }

    isThreeOfAKind() {
        this.getCounts();
        return this.counts.some(count => count >= 3);
    }

    isFourOfAKind() {
        this.getCounts();
        return this.counts.some(count => count >= 4);
    }

    isFullHouse() {
        this.getCounts();
        return this.counts.includes(3) && this.counts.includes(2);
    }

    isSmallStraight() {
        const unique = [...new Set(this.dice)].sort();
        const straights = [
            [1,2,3,4],
            [2,3,4,5],
            [3,4,5,6]
            ];
        return straights.some(straight =>
            straight.every(num => unique.includes(num))
        );
    }

    isLargeStraight() {
        const unique = [...new Set(this.dice)].sort();
        return (
            JSON.stringify(unique) === JSON.stringify([1,2,3,4,5]) ||
            JSON.stringify(unique) === JSON.stringify([2,3,4,5,6])
        );
    }

    isGameEnd() {
        return this.available.slice(0, 13).every(v => v === 0);
    }

    getPossibleScores() {
        const scores = {};
        this.getCounts();
        for (let i = 0; i <= 12; i++) {
            if (this.available[i]) {
                switch(i) {
                    case 0: scores.ones = this.counts[0]; break;
                    case 1: scores.twos = this.counts[1] * 2; break;
                    case 2: scores.threes = this.counts[2] * 3; break;
                    case 3: scores.fours = this.counts[3] * 4; break;
                    case 4: scores.fives = this.counts[4] * 5; break;
                    case 5: scores.sixes = this.counts[5] * 6; break;
                    case 6: scores.ok3 = this.isThreeOfAKind() ? this.dice.reduce((a,b)=>a+b,0) : 0; break;
                    case 7: scores.ok4 = this.isFourOfAKind() ? this.dice.reduce((a,b)=>a+b,0) : 0; break;
                    case 8: scores.fh = this.isFullHouse() ? 25 : 0; break;
                    case 9: scores.ss = this.isSmallStraight() ? 30 : 0; break;
                    case 10: scores.ls = this.isLargeStraight() ? 40 : 0; break;
                    case 11: scores.chance = this.dice.reduce((a,b)=>a+b,0); break;
                    case 12: scores.yahtzee = this.isYahtzee() ? 50 : 0; break;
                }
            }
        }
        return scores;
    }
}