// Ref and two bots to demonstrate proof of concept game
// The simplest possible coup game - income and coup strategy
// Run with `node income-bot.js` when running `npm run dev` in another terminal

const http = require('http');
const base_url = "http://localhost:6080/";

async function call_api(method, callback) {
	let result_promise = new Promise((resolve, reject) => {
		const request_url = base_url + method;
		try {
			http.get(request_url, (response) => {

				let data = '';
				response.on('data', (chunk) => { data += chunk; });
				response.on('end', (chunk) => { result = JSON.parse(data); resolve(result); });
				response.on('error', (error) => { reject(error); });
			});
		}
		catch (error) {
			reject(error);
		}
	});
	return result_promise;
}

// Referee handles the game state and calls the player whose turn it is to take action or respond to do so
async function referee() {
	const setup_result = await call_api('setup');
	const session_id = setup_result['_id'];

	let result;
	do {
		let status = await call_api(session_id + '/status');
		if (status.current_target === 0 || (status.current_target === undefined && status.current_turn === 0)) {
			result = await chahmbot(session_id);
			console.log('status after action', result);
			if (result.Error) {
				break;
			}
		} else {
			result = await justinbot(session_id);
			console.log('status after action', result);
			if (result.Error) {
				break;
			}
		}
	} while (result.Error || result.players.length > 1);
	if(result.Error) {
		console.log(result.Error);
	} else {
		console.log('winner: ' + result.players[0].name);
	}
}

async function chahmbot(session_id, player_num = 0) {
	let status = await call_api(session_id + '/status');
	console.log('chahmbot player', player_num);
	console.log('current turn', status.current_turn);
	console.log('status before action', status);
	coins = status.players[player_num].coins;

	if (status.current_stage === 'lose_influence' && status.current_target === player_num) {
		console.log(player_num, 'losing influence');
		const character_get_rid_of = status.players[player_num].cards[0];
		result = await call_api(session_id + '/lose_influence?player=' + player_num + '&character=' + character_get_rid_of);
		return result;
	}

	else if (coins >= 7) {
		console.log(player_num, 'couping');
		const result = await call_api(session_id + '/action/coup?player=' + player_num + '&target=' + (player_num === 1 ? 0 : 1));
		return result;
	} else {
		console.log(player_num, 'taking income');
		const result = await call_api(session_id + '/action/income?player=' + player_num);
		return result;
	}
}

async function justinbot(session_id, player_num = 1) {
	let status = await call_api(session_id + '/status');
	console.log('justinbot player', player_num);
	console.log('current turn', status.current_turn);
	console.log('status before action', status);
	coins = status.players[player_num].coins;

	if (status.current_stage === 'lose_influence' && status.current_target === player_num) {
		console.log(player_num, 'losing influence');
		const character_get_rid_of = status.players[player_num].cards[0];
		result = await call_api(session_id + '/lose_influence?player=' + player_num + '&character=' + character_get_rid_of);
		return result;
	}

	else if (coins >= 7) {
		console.log(player_num, 'couping');
		const result = await call_api(session_id + '/action/coup?player=' + player_num + '&target=' + (player_num === 1 ? 0 : 1));
		return result;
	} else {
		console.log(player_num, 'taking income');
		const result = await call_api(session_id + '/action/income?player=' + player_num);
		return result;
	}
}

// Create the game and begin the game loop
referee();
