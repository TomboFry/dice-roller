const socket = io();

function elm(id) {
	return document.getElementById(id);
}

let users = [];
let my_user = null;
let user_name = '';

const set_player = elm('set_player');
const player_name = elm('player_name');
const player_name_title = elm('player_name_title');
const player_list = elm('player_list');
const roll_buttons = elm('roll_buttons');
const recent_roll_block = elm('recent_roll_block');
const recent_roll = elm('recent_roll');
const bonus_input = elm('bonus_input');

const buttons = {
	d2: elm('1d2'),
	d3: elm('1d3'),
	d4: elm('1d4'),
	d6: elm('1d6'),
	d8: elm('1d8'),
	d10: elm('1d10'),
	d12: elm('1d12'),
	d20: elm('1d20'),
	d100: elm('1d100'),
};

function ready () {
	set_player.style.display = 'block';
	roll_buttons.style.display = 'none';
	recent_roll_block.style.display = 'none';

	const keys = Object.keys(buttons);

	for (let i = 0; i < keys.length; i++) {
		const button = buttons[keys[i]];
		button.addEventListener(
			'click',
			roll(keys[i].replace('d',''))
		);
	}
}

function roll (size) {
	return () => {
		const bonus = parseFloat(bonus_input.value);
		bonus_input.focus();
		socket.emit('roll', { size, bonus });
	};
}

function stripString (input) {
	return input.trim().replace(/[^a-zA-Z0-9.\- ]/g, '');
}

function typeName () {
	const name = stripString(player_name.value);
	player_name_title.innerText = `You will be '${name}'`;
}

function validateBonus () {
	let final_bonus = parseFloat(bonus_input.value);

	if (final_bonus < 0) final_bonus = 0;
	if (isNaN(final_bonus) || !isFinite(final_bonus)) {
		final_bonus = 0;
	}

	final_bonus = Math.floor(final_bonus);

	bonus_input.value = final_bonus;
}

function getMyUser () {
	if (user_name === '') return;
	const index = users.findIndex(user => user.name === user_name);
	if (index === -1) return;

	my_user = users[index];

	let roll = 'N/A';

	if (my_user.history.length > 0) {
		roll = my_user.history[0].result;
	}

	recent_roll.innerText = roll;
}

function setName () {
	const name = stripString(player_name.value);

	if (name === '') return;

	user_name = name;

	socket.emit('username', name);

	set_player.style.display = 'none';
	roll_buttons.style.display = 'block';
	recent_roll_block.style.display = 'inline-block';
	player_name_title.innerText = `You are '${name}'`;
}

function formatDate (date) {
	let hour = date.getHours();
	let minute = date.getMinutes();
	let seconds = date.getSeconds();

	if (hour < 10) hour = `0${hour}`;
	if (minute < 10) minute = `0${minute}`;
	if (seconds < 10) seconds = `0${seconds}`;

	return `${hour}:${minute}:${seconds}`;
}

function updateUsers () {
	if (Array.isArray(users) === false) return;

	let innerHTML = '';

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		innerHTML += '<li class=\'player block\'>';
		innerHTML += `<span class=\'player_name\'>${user.name}</span>`;
		innerHTML += '<ul>';
		for (let i = 0; i < user.history.length; i++) {
			const roll = user.history[i];
			innerHTML += '<li class=\'roll\'>';
			innerHTML += `${roll.size} + ${roll.bonus} = `;
			innerHTML += '<span class=\'roll_result\'>';
			innerHTML += roll.result;
			innerHTML += '</span>';
			const ts = formatDate(new Date(roll.timestamp));
			innerHTML += `<span class=\'roll_time\'>${ts}</span>`;
			innerHTML += '</li>';
		}
		innerHTML += '</ul></li>';
	}

	player_list.innerHTML = innerHTML;
}

socket.on('new_user_list', new_users => {
	users = new_users;
	updateUsers();
	getMyUser();
});

document.addEventListener('DOMContentLoaded', ready);
