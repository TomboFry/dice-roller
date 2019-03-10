const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const shortid = require('shortid');
const port = 3333;

const { Roll, User } = require('./users');

app.use(express.static('static'));

const users = [];

const getUserIndex = id => {
	return users.findIndex(existing => {
		return existing.id === id;
	});
};

io.on('connection', socket => {
	console.log('Connected');

	// Send the user list to new players
	socket.emit('new_user_list', users);

	let user = null;

	// Runs when the user sets their username
	socket.on('username', username => {
		// Create a new user based on their username
		user = new User(username, shortid());
		users.push(user);

		// Send new user to all players
		io.emit('new_user_list', users);
	});

	// Runs when the user rolls a die
	socket.on('roll', ({ size, bonus }) => {
		if (bonus === null) bonus = 0;
		user.roll(size, bonus);
		
		// Update the users array
		const index = getUserIndex(user.id);
		if (index !== -1) users[index] = user;
		
		// Send to all players
		io.emit('new_user_list', users);
	});

	// When the user disconnects for whatever reason
	socket.on('disconnect', () => {
		console.log('Disconnected');

		// If they haven't set their username, there's no point
		if (user === null) return;

		// Remove the user from the array
		const index = getUserIndex(user.id);
		if (index === -1) return;
		users.splice(index, 1);

		// Send new list to all players
		io.emit('new_user_list', users);
	});
});

server.listen(port, () => console.log(`Listening on port ${port}!`));

