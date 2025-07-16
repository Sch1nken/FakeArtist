import { Server, Socket } from 'socket.io';
import { GAME_STATE, IDrawData, IGame, IPlayer, IVoteData, UPDATE_TYPE } from 'shared';
import { Player } from './player';
import { AVAILABLE_COLORS, MIN_PLAYERS_TO_START_GAME } from './constants';

export class Game implements IGame {
    private io: Server;

    actualPlayers: IPlayer[] = [];
    canVote: IPlayer[] = [];
    currentGameState: GAME_STATE = GAME_STATE.LOBBY;
    currentPlayer: IPlayer | null = null;
    currentTurn: number = 0;
    disconnectedDuringSession: string[] = [];
    fakeArtist: IPlayer | null = null;
    hint: string = '';
    leader: IPlayer | null = null;
    players: IPlayer[] = [];
    playerTurn: IPlayer[] = [];
    playerVotes: { [playerId: string]: number; } = {};
    possibleLeaders: IPlayer[] = [];
    roomId: string;
    spectators: IPlayer[] = [];
    topic: string = '';
    turnDrawdata: IDrawData[][] = [];

    constructor(roomId: string, ioInstance: Server) {
        this.roomId = roomId;
        this.io = ioInstance;
    }

    addPlayer(socket: Socket, username: string, persistentId: string): void {
        let player: Player | null = this.getPlayerByPersistentId(persistentId);

        if (player) {
            console.log(`Player ${username} (${persistentId}) reconnected to the room ${this.roomId}`);
            player.id = socket.id;
            // Figure out if we can have reconnecting players not be spectators?
            // Also define what should happen if a player disconnects in the first place...
            // player.isSpectator = false;
            this.disconnectedDuringSession = this.disconnectedDuringSession.filter(id => id !== persistentId);
            //this.spectators = this.spectators.filter(s => s.persistentId !== persistentId);

            this.io.to(socket.id).emit(UPDATE_TYPE.MESSAGE, `Welcome back, ${username}!`);
        } else {
            player = new Player(socket.id, persistentId, username, this.getNextFreePlayerColor());
            this.players.push(player);
            console.log(`New player ${username} (${persistentId}) joined room ${this.roomId}`);
            this.io.to(socket.id).emit(UPDATE_TYPE.MESSAGE, `Welcome, ${username}!`);
        }

        socket.join(this.roomId);
        socket.game = this;
        socket.persistentId = persistentId;
        socket.playerName = username;

        if (this.currentGameState !== GAME_STATE.LOBBY) {
            player.isSpectator = true;
            this.spectators.push(player);
            this.io.to(socket.id).emit(UPDATE_TYPE.MESSAGE, `A game is in progress. You are a spectator.`);
        }

        this.updatePlayerList();
        this.emitSpectatorCount();

        // We have several ifs below to sort of synthetically move the new player
        // Through the passed game states

        if (this.currentGameState !== GAME_STATE.LOBBY) {
            // If game is already running, tell the new player about it
            this.io.to(socket.id).emit(UPDATE_TYPE.GAME_START);
            // Not sure if below is really needed, I think it can be handled better
            //this.io.to(socket_.id).emit('actually_start_game', this.actualPlayers);
        }

        // Tell player about the topic :)
        let playerTopic = '';
        if (player.isSpectator) {
            // Don't show any info to spectators
            // a) In case the player tries to be smart and connect with a second browser window.
            // b) Allows spectators to also guess :) 
            playerTopic = '? (You are a spectator. No cheating!)';
        } else if (this.fakeArtist && player.persistentId === this.fakeArtist.persistentId) {
            playerTopic = '? (You are the Fake Artist!)';
        } else {
            playerTopic = this.topic;
        }
        this.io.to(socket.id).emit(UPDATE_TYPE.TOPIC_SELECTED, playerTopic, this.hint);

        for (let turn = 0; turn < this.currentTurn; turn++) {
            this.io.to(socket.id).emit(UPDATE_TYPE.ADVANCE_TURN, turn, this.playerTurn[turn]);
            // I _think_ this should work...
            // For finished rounds it just passes the draw data (client re-draws them on their end)
            // It's been some time so currently not sure if turnDrawdata also contains the current live draw-data
            // If yes, this might work without issues?
            // If not, we'd need to additionally push out the current live draw-data

            for (const drawData of this.turnDrawdata[turn]) {
                this.io.to(socket.id).emit('draw_data', turn, drawData);
            }
        }

        if (this.currentGameState === GAME_STATE.RESULTS ||
            this.currentGameState === GAME_STATE.VOTING) {
            this.io.to(socket.id).emit(
                'game_finished',
                this.leader,
                this.actualPlayers
            );
            if (this.currentGameState === GAME_STATE.RESULTS) {
                const voteDataForClient: IVoteData = {
                    done: true,
                    fakeArtist: this.fakeArtist,
                    leader: this.leader,
                    players: this.players,
                    playersVoted: this.actualPlayers.map(p => p.id),
                    playerVotes: this.playerVotes,
                    topic: this.topic
                };
                this.io.to(socket.id).emit(UPDATE_TYPE.VOTE_RESULTS, voteDataForClient);
            } else if (this.currentGameState === GAME_STATE.VOTING) {
                this.updateVotes();
            }
        }
    }

    advanceTurn(): void {
        console.log('Current turn index:', this.currentTurn);

        if (this.currentGameState === GAME_STATE.VOTING) {
            return;
        }

        if (this.currentTurn >= this.playerTurn.length) {
            this.startVoting();
            return;
        }

        this.currentPlayer = this.playerTurn[this.currentTurn];

        if (this.currentPlayer && this.disconnectedDuringSession.includes(this.currentPlayer.persistentId)) {
            console.log(`Skipping turn for disconnected player: ${this.currentPlayer.playerName}`);
            this.currentTurn++;
            this.advanceTurn();
            return;
        }

        if (this.currentPlayer) { // Ensure current_player is not null
            this.io.to(this.roomId)
                .emit(UPDATE_TYPE.ADVANCE_TURN, this.currentTurn, this.currentPlayer);
        } else {
            console.warn(`No current player for turn ${this.currentTurn} in room ${this.roomId}.`);
        }

        this.currentTurn++;
    };

    emitSpectatorCount(): void {
        this.io.to(this.roomId).emit(UPDATE_TYPE.SPECTATOR_COUNT, this.getSpectatorCount());
    }


    getConnectedActivePlayers(): Player[] {
        return this.players.filter(p => p.id !== '' && !p.isSpectator);
    }

    getNextFreePlayerColor(): string {
        // TODO: There is probably better ways... but if it works...
        for (const color of AVAILABLE_COLORS) {
            let isFree = true;
            for (const player of this.players) {
                if (color === player.playerColor) {
                    isFree = false;
                    break;
                }
            }
            if (isFree) {
                return color;
            }
        }
        return '#000000';
    };

    getPlayerByPersistentId(id: string): Player | null {
        return this.players.find(item => item.persistentId === id) || null;
    }

    getPlayerBySocketId(socketId: string): Player | null {
        return this.players.find(item => item.id === socketId) || null;
    }

    getSpectatorCount(): number {
        // Count connected spectators
        return this.players.filter(p => p.isSpectator && p.id !== '').length;
    }

    notifyLeader(): void {
        if (!this.leader) {
            console.error(`No leader selected for room ${this.roomId}`);
            // TODO: Reset state to lobby, notify players?
            return;
        }

        this.io.to(this.roomId).emit(UPDATE_TYPE.LEADER_SELECTED, this.leader);
    }

    preparePlayerTurns(): void {
        // Every player draws 2 times... easy way to have some sort of list to work through...
        this.playerTurn = this.actualPlayers.concat(this.actualPlayers);
        // Create new empty array with correct size
        this.turnDrawdata = Array.from({ length: this.playerTurn.length }, () => []);
    };

    removePlayer(socketId: string): void {
        const playerToRemove = this.getPlayerBySocketId(socketId);
        if (!playerToRemove) {
            // No player to remove. Notify someone?
            return;
        }

        console.log(`Removing player ${playerToRemove.playerName} (${playerToRemove.persistentId}) from room ${this.roomId}`);

        if (this.currentGameState !== GAME_STATE.LOBBY && !this.disconnectedDuringSession.includes(playerToRemove.persistentId)) {
            // Player disconnected during session
            this.disconnectedDuringSession.push(playerToRemove.persistentId);
            console.log(`Marked ${playerToRemove.playerName} as disconnected for this session.`);
        }

        playerToRemove.id = ''; // clear socket id, it's always random/unique
        playerToRemove.isSpectator = true;

        // Remove from spectators if was a spectator before. To keep counter accurate
        this.spectators = this.spectators.filter(s => s.id !== socketId);

        this.updatePlayerList();
        this.emitSpectatorCount();

        // If the game is running and we are not enough players, reset the game
        const activePlayersCount = this.getConnectedActivePlayers().length;
        if (this.currentGameState !== GAME_STATE.LOBBY && activePlayersCount < MIN_PLAYERS_TO_START_GAME) {
            this.io.to(this.roomId).emit(UPDATE_TYPE.MESSAGE, `Game ended in room ${this.roomId} due to too few active players.`);
            this.resetGameState();
            return;
        }

        if (this.currentGameState === GAME_STATE.DRAWING && this.currentPlayer?.id === socketId) {
            this.advanceTurn();
        }
        // If game was in voting and a voter disconnected, update votes
        if (this.currentGameState === GAME_STATE.VOTING) {
            const voterIndex = this.canVote.findIndex(p => p.id === socketId);
            if (voterIndex !== -1) {
                this.canVote.splice(voterIndex, 1);
                this.updateVotes();
            }
        }
    }

    resetGameState(): void {
        console.log(`Resetting game state for room ${this.roomId}`);
        this.currentGameState = GAME_STATE.LOBBY;
        this.topic = '';
        this.hint = '';
        this.disconnectedDuringSession = [];
        this.leader = null;
        this.fakeArtist = null;
        this.currentTurn = 0;
        this.currentPlayer = null;
        this.playerTurn = [];
        this.actualPlayers = [];
        this.turnDrawdata = [];
        this.canVote = [];
        this.playerVotes = {};

        // Reset all players for the new game
        this.players.forEach(p => {
            // Score should remain between rounds, iirc
            // p.score = 0;
            p.ready = false;
            // Nobody is spectator since we start from the Lobby
            p.isSpectator = false;
        });
        this.spectators = [];

        this.updatePlayerList();
        this.emitSpectatorCount();
        // Notify clients to reset their UI
        this.io.to(this.roomId).emit(UPDATE_TYPE.GAME_RESET);
        this.io.to(this.roomId).emit(UPDATE_TYPE.MESSAGE, 'Game has reset. Waiting for players to get ready for a new round!');
    }

    selectFakeArtist(): void {
        if (this.actualPlayers.length === 0) {
            // Should never really happen?
            console.error(`Error: Cannot select fake artist for empty actual_players list in game ${this.roomId}`);
            // TODO: Reset state to lobby, abort start?
            return;
        }

        const fakeArtist = this.actualPlayers[Math.floor(Math.random() * this.actualPlayers.length)];
        this.fakeArtist = fakeArtist;
    }

    selectLeader(): void {
        const eligiblePlayers = this.players.filter(p => !p.isSpectator);
        if (eligiblePlayers.length === 0) {
            // Should never really happen, right?
            console.error(`Error: Cannot select leader for empty eligible player list in room ${this.roomId}`);
            // TODO: Reset state to lobby, abort start?
            return;
        }

        // TODO: Instead of randomly selecting a leader have at least some logic to prevent duplicates?
        // Basically have an array thats filled once and then needs to empty before refilling?
        // (new players will get added as well, so they don't have to potentially wait as long)
        const leader = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
        this.leader = leader;

        const remainingPlayers = eligiblePlayers.filter(p => p.id !== leader.id);
        this.actualPlayers = remainingPlayers.sort(() => 0.5 - Math.random());
    }

    start_game(): void {
        this.currentGameState = GAME_STATE.TOPIC_SELECTION;
        // Maybe send reduced game state as payload? 
        // Not really necessary since player list + spectator count should always
        // be present no matter the state
        this.io.to(this.roomId).emit(UPDATE_TYPE.GAME_START);

        this.playerTurn.forEach((p) => {
            p.ready = false;
        });

        this.selectLeader();
        this.preparePlayerTurns();
        this.selectFakeArtist();
        this.notifyLeader();

        this.spectators = [];
        this.players.forEach(p => p.isSpectator = false);
        this.updatePlayerList();
        this.emitSpectatorCount();
    }

    startVoting(): void {
        this.currentGameState = GAME_STATE.VOTING;
        this.playerVotes = {};
        this.canVote = this.actualPlayers.filter(p => p.id !== this.leader?.id);

        this.canVote.forEach((p) => {
            this.playerVotes[p.id] = 0;
        });

        console.log('GAME FINISHED! Starting Voting.');
        this.io.to(this.roomId).emit(UPDATE_TYPE.GAME_FINISH, this.leader, this.actualPlayers);
    };

    updatePlayerList(): void {
        this.io.to(this.roomId).emit(UPDATE_TYPE.PLAYER_DATA, this.players);
    }

    updateVotes(): void {
        const voteData: IVoteData = {
            leader: this.leader,
            players: this.players,
            playersVoted: this.actualPlayers.filter(p => !this.canVote.some(v => v.id === p.id)).map(p => p.id),
            topic: this.topic
        };

        if (this.canVote.length === 0) {
            voteData.done = true;
            voteData.playerVotes = this.playerVotes;
            voteData.fakeArtist = this.fakeArtist;
            this.currentGameState = GAME_STATE.RESULTS;
            this.io.to(this.roomId).emit(UPDATE_TYPE.VOTE_RESULTS, voteData);
            // TODO: Maybe have the result screen also be the Lobby-Screen sort of? 
            // Would mean players joining during results can play next game
            // And will see the results of THIS game (picture data + vote data)
            setTimeout(() => this.resetGameState(), 10000);
        } else {
            this.io.to(this.roomId).emit(UPDATE_TYPE.VOTE_DATA, voteData);
        }
    }
}
