let socket = io();

function elm(id) {
	return document.getElementById(id);
}

let users = [];
let my_user = null;
let my_user_index = -1;
let user_name = '';

const set_player = elm('set_player');
const player_name = elm('player_name');
const player_name_title = elm('player_name_title');
const player_list = elm('player_list');
const roll_buttons = elm('roll_buttons');
const recent_roll_block = elm('recent_roll_block');
const recent_roll = elm('recent_roll');
const bonus_input = elm('bonus_input');
const error_container = elm('error_container');
const error_message = elm('error_message');

function visible (elm, visible = true) {
	if (visible === false) {
		elm.classList.add('hidden');
		return;
	}

	elm.classList.remove('hidden');
}

function ready () {
	visible(set_player);
	visible(roll_buttons, false);
	visible(recent_roll_block, false);
	visible(error_container, false);

	typeName();
}

function errorShow (message) {
	error_message.innerText = message;
	visible(error_container);
}

function errorClose () {
	visible(error_container, false);
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

	if (isNaN(final_bonus) || !isFinite(final_bonus)) final_bonus = 0;
	if (final_bonus < -20) final_bonus = -20;
	if (final_bonus > 20) final_bonus = 20;

	final_bonus = Math.floor(final_bonus);

	bonus_input.value = final_bonus;
}

function getMyUser () {
	if (user_name === '') return;
	const index = users.findIndex(user => user.name === user_name);
	if (index === -1) return;

	my_user = users[index];
	my_user_index = index;

	let roll = '0';

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

	visible(set_player, false);
	visible(roll_buttons);
	visible(recent_roll_block);
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
		const is_me = i === my_user_index;
		innerHTML += '<li class=\'player block\'>';
		innerHTML += `<span class=\'player_name${is_me ? ' accent' : ''}\'>${user.name}${is_me ? ' (You)' : ''}</span>`;
		innerHTML += '<ul>';
		for (let i = 0; i < user.history.length; i++) {
			const roll = user.history[i];
			innerHTML += `<li class=\'roll${roll.latest === true ? ' latest' : ''}\'>`;
			innerHTML += '<span class="roll_full_string">';
			innerHTML += `${roll.size} + ${roll.bonus} → `;
			innerHTML += '<span class=\'roll_result\'>';
			innerHTML += roll.result;
			innerHTML += '</span>';
			innerHTML += '</span>';
			const ts = formatDate(new Date(roll.timestamp));
			innerHTML += `<span class=\'roll_time\'>${ts}</span>`;
			innerHTML += '</li>';
		}
		innerHTML += '</ul></li>';
	}

	player_list.innerHTML = innerHTML;
}

socket.on('disconnect', () => {
	ready();
	if (my_user === null) return;
	socket = null;
	socket = io();
});

socket.on('new_user_list', new_users => {
	users = new_users;
	getMyUser();
	updateUsers();
});

socket.on('server_error', errorShow);

document.addEventListener('DOMContentLoaded', ready);
