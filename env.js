// Load `.env` config ASAP
require('dotenv').config();

function setDefault (name, defaultValue) {
	if (process.env[name] === undefined) {
		process.env[name] = defaultValue;
		return;
	}

	process.env[name] = parseFloat(process.env[name]);
}

setDefault('HTTP_PORT', 3333);
setDefault('MIN_BONUS', -20);
setDefault('MAX_BONUS', 20);

module.exports = {
	HTTP_PORT: process.env.HTTP_PORT,
	MAX_BONUS: process.env.MAX_BONUS,
	MIN_BONUS: process.env.MIN_BONUS,
};
