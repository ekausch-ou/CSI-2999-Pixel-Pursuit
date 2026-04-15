export class Tile {
    constructor(number = 0) {
        this.value = number;
        this.tileColor = null;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }

    toString() {
        return String(this.value);
    }

    setColor() {
        if (this.value === 0) this.tileColor = { r: 205, g: 193, b: 180 };
        else if (this.value === 2) this.tileColor = { r: 238, g: 228, b: 218 };
        else if (this.value === 4) this.tileColor = { r: 237, g: 224, b: 200 };
        else if (this.value === 8) this.tileColor = { r: 242, g: 177, b: 121 };
        else if (this.value === 16) this.tileColor = { r: 245, g: 149, b: 99 };
        else if (this.value === 32) this.tileColor = { r: 246, g: 124, b: 95 };
        else if (this.value === 64) this.tileColor = { r: 246, g: 94, b: 59 };
        else if (this.value === 128) this.tileColor = { r: 237, g: 207, b: 114 };
        else if (this.value === 256) this.tileColor = { r: 237, g: 204, b: 97 };
        else if (this.value === 512) this.tileColor = { r: 237, g: 200, b: 80 };
        else if (this.value === 1024) this.tileColor = { r: 237, g: 197, b: 63 };
        else if (this.value === 2048) this.tileColor = { r: 237, g: 194, b: 46 };
        else {
            const power = Math.log2(this.value);

            const red = Math.max(80, 237 - (power - 11) * 12);
            const green = Math.max(40, 194 - (power - 11) * 10);
            const blue = Math.min(255, 60 + (power - 11) * 18);

            this.tileColor = { r: red, g: green, b: blue };
        }
    }

    getColor() {
        this.setColor();
        const { r, g, b } = this.tileColor;
        return `rgb(${r}, ${g}, ${b})`;
    }
}