const env = require('./env');

const validSizes = [
	2, 3, 4, 6, 8,
	10, 12, 20, 100
];

class Roll {
	constructor (size, bonus) {
		this.size = size;
		this.bonus = bonus;
		this.timestamp = new Date();
		this.latest = true;

		this.result = this.calculateRoll();
	}

	calculateRoll () {
		return Math.round(Math.random() * (this.size - 1)) + this.bonus + 1;
	}
}

class User {
	constructor (name, id) {
		// Used for display purposes
		this.name = name.trim().replace(/[^a-zA-Z0-9.\-_ ]/g, '');;
		this.id = id;

		// Array of Roll
		this.history = [];
	}

	updateRolls () {
		this.history.forEach(roll => roll.latest = false);
	}

	roll (size, bonus) {
		size = parseFloat(size);
		bonus = parseFloat(bonus);

		if (isNaN(size)) throw new Error('Size must be a number');
		if (isNaN(bonus)) throw new Error('Bonus must be a number');

		if (validSizes.includes(size) === false) {
			throw new Error(`Dice size '${size}' is invalid`);
		}

		if (bonus > env.MAX_BONUS) bonus = env.MAX_BONUS;
		if (bonus < env.MIN_BONUS) bonus = env.MIN_BONUS;

		this.history.unshift(new Roll(size, bonus));
		this.history = this.history.slice(0, 12);
	}
}

module.exports = {
	Roll,
	User,
};
