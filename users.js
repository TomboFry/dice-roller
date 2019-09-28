const validSizes = [
	2, 3, 4, 6, 8,
	10, 12, 20, 100
];

class Roll {
	constructor (size, bonus) {
		this.size = size;
		this.bonus = bonus;
		this.timestamp = new Date();

		this.result = this.calculateRoll();
	}

	calculateRoll () {
		return Math.round(Math.random() * (this.size - 1)) + this.bonus + 1;
	}
}

class User {
	constructor (name, id) {
		// Used for display purposes
		this.name = name;
		this.id = id;

		// Array of Roll
		this.history = [];
	}

	roll (size, bonus) {
		size = parseFloat(size);
		bonus = parseFloat(bonus);

		if (isNaN(size)) throw new Error('Size must be a number');
		if (isNaN(bonus)) throw new Error('Bonus must be a number');

		if (validSizes.includes(size) === false) {
			throw new Error(`Dice size '${size}' is invalid`);
		}

		if (bonus > 20) bonus = 20;
		if (bonus < -20) bonus = -20;

		this.history.unshift(new Roll(size, bonus));
		this.history = this.history.slice(0, 12);
	}
}

module.exports = {
	Roll,
	User,
};
