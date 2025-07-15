import { Server, Socket } from 'socket.io';
import { GAME_STATE, IDrawData, IGame, IPlayer, IVoteData } from 'shared';
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
    room_id: string;
    spectators: IPlayer[] = [];
    topic: string = '';
    turnDrawdata: IDrawData[][] = [];

    constructor(room_id_: string, ioInstance: Server) {
        this.room_id = room_id_;
        this.io = ioInstance;
    }

    add_player(socket: Socket, username: string, persistentId: string): void {
        let player: Player | null = this.get_player_by_persistent_id(persistentId);

        if (player) {
            console.log(`Player ${username} (${persistentId}) reconnected to the room ${this.room_id}`);
            player.id = socket.id;
            // Figure out if we can have reconnecting players not be spectators?
            // Also define what should happen if a player disconnects in the first place...
            // player.isSpectator = false;
            this.disconnectedDuringSession = this.disconnectedDuringSession.filter(id => id !== persistentId);
            //this.spectators = this.spectators.filter(s => s.persistentId !== persistentId);

            this.io.to(socket.id).emit('message', `Welcome back, ${username}!`);
        } else {
            player = new Player(socket.id, persistentId, username, this.get_next_free_player_color());
            this.players.push(player);
            console.log(`New player ${username} (${persistentId}) joined room ${this.room_id}`);
            this.io.to(socket.id).emit('message', `Welcome, ${username}!`);
        }

        socket.join(this.room_id);
        socket.game = this;
        socket.persistentId = persistentId;
        socket.playerName = username;

        if (this.currentGameState !== GAME_STATE.LOBBY) {
            player.isSpectator = true;
            this.spectators.push(player);
            this.io.to(socket.id).emit('message', `A game is in progress. You are a spectator.`);
        }

        this.update_player_list();

        // TODO: More... maybe it can be cleaned up first
    };

    advance_turn(): void {
        console.log('Current turn index:', this.currentTurn);

        if (this.currentGameState === GAME_STATE.VOTING) {
            return;
        }

        if (this.currentTurn >= this.playerTurn.length) {
            this.start_voting();
            return;
        }

        this.currentPlayer = this.playerTurn[this.currentTurn];

        if (this.currentPlayer && this.disconnectedDuringSession.includes(this.currentPlayer.persistentId)) {
            console.log(`Skipping turn for disconnected player: ${this.currentPlayer.playerName}`);
            this.currentTurn++;
            this.advance_turn();
            return;
        }

        if (this.currentPlayer) { // Ensure current_player is not null
            this.io.to(this.room_id)
                .emit('advance_turn', this.currentTurn, this.currentPlayer);
        } else {
            console.warn(`No current player for turn ${this.currentTurn} in room ${this.room_id}.`);
        }

        this.currentTurn++;
    }


    emitSpectatorCount(): void {
        this.io.to(this.room_id).emit('spectator_count_update', this.getSpectatorCount());
    }

    get_next_free_player_color(): string {
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

    get_player_by_persistent_id(id: string): Player | null {
        return this.players.find(item => item.persistentId === id) || null;
    }

    get_player_by_socket_id(socketId: string): Player | null {
        return this.players.find(item => item.id === socketId) || null;
    }

    getConnectedActivePlayers(): Player[] {
        return this.players.filter(p => p.id !== '' && !p.isSpectator);
    }

    getSpectatorCount(): number {
        // Count connected spectators
        return this.players.filter(p => p.isSpectator && p.id !== '').length;
    }

    prepare_player_turns(): void {
        // Every player draws 2 times... easy way to have some sort of list to work through...
        this.playerTurn = this.actualPlayers.concat(this.actualPlayers);
        // Create new empty array with correct size
        this.turnDrawdata = Array.from({ length: this.playerTurn.length }, () => []);
    };

    remove_player(socketId: string): void {
        const playerToRemove = this.get_player_by_socket_id(socketId);
        if (!playerToRemove) {
            // No player to remove. Notify someone?
            return;
        }

        console.log(`Removing player ${playerToRemove.playerName} (${playerToRemove.persistentId}) from room ${this.room_id}`);

        if (this.currentGameState !== GAME_STATE.LOBBY && !this.disconnectedDuringSession.includes(playerToRemove.persistentId)) {
            // Player disconnected during session
            this.disconnectedDuringSession.push(playerToRemove.persistentId);
            console.log(`Marked ${playerToRemove.playerName} as disconnected for this session.`);
        }

        playerToRemove.id = ''; // clear socket id, it's always random/unique
        playerToRemove.isSpectator = true;

        // Remove from spectators if was a spectator before. To keep counter accurate
        this.spectators = this.spectators.filter(s => s.id !== socketId);

        this.update_player_list();
        this.emitSpectatorCount();

        // If the game is running and we are not enough players, reset the game
        const activePlayersCount = this.getConnectedActivePlayers().length;
        if (this.currentGameState !== GAME_STATE.LOBBY && activePlayersCount < MIN_PLAYERS_TO_START_GAME) {
            this.io.to(this.room_id).emit('message', `Game ended in room ${this.room_id} due to too few active players.`);
            this.reset_game_state();
            return;
        }

        if (this.currentGameState === GAME_STATE.DRAWING && this.currentPlayer?.id === socketId) {
            this.advance_turn();
        }
        // If game was in voting and a voter disconnected, update votes
        if (this.currentGameState === GAME_STATE.VOTING) {
            const voterIndex = this.canVote.findIndex(p => p.id === socketId);
            if (voterIndex !== -1) {
                this.canVote.splice(voterIndex, 1);
                this.update_votes();
            }
        }
    }

    reset_game_state(): void {
        console.log(`Resetting game state for room ${this.room_id}`);
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
            p.score = 0;
            p.ready = false;
            // Nobody is spectator since we start from the Lobby
            p.isSpectator = false;
        });
        this.spectators = [];

        this.update_player_list();
        this.emitSpectatorCount();
        // Notify clients to reset their UI
        this.io.to(this.room_id).emit('game_reset');
        this.io.to(this.room_id).emit('message', 'Game has reset. Waiting for players to get ready for a new round!');
    }

    select_fake_artist(): void {
        if (this.actualPlayers.length === 0) {
            // Should never really happen?
            console.error(`Error: Cannot select fake artist for empty actual_players list in game ${this.room_id}`);
            return;
        }

        const fake_artist = this.actualPlayers[Math.floor(Math.random() * this.actualPlayers.length)];
        this.fakeArtist = fake_artist;
    }

    select_leader(): void {
        const eligiblePlayers = this.players.filter(p => !p.isSpectator);
        if (eligiblePlayers.length === 0) {
            // Should never really happen, right?
            console.error(`Error: Cannot select leader for empty eligible player list in room ${this.room_id}`);
            return;
        }

        // TODO: Instead of randomly selecting a leader have at least some logic to prevent duplicates?
        // Basically have an array thats filled once and then needs to empty before refilling?
        // (new players will get added as well, so they don't have to potentially wait as long)
        const leader = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
        this.leader = leader;

        const remaining_players = eligiblePlayers.filter(p => p.id !== leader.id);
        this.actualPlayers = remaining_players.sort(() => 0.5 - Math.random());
    }

    start_voting(): void {
        this.currentGameState = GAME_STATE.VOTING;
        this.playerVotes = {};
        this.canVote = this.actualPlayers.filter(p => p.id !== this.leader?.id);

        this.canVote.forEach((p) => {
            this.playerVotes[p.id] = 0;
        });

        console.log('GAME FINISHED! Starting Voting.');
        this.io.to(this.room_id).emit('game_finished', this.leader, this.actualPlayers);
    };

    update_player_list(): void {
        this.io.to(this.room_id).emit('player_data', this.players);
    }

    update_votes(): void {
        const vote_data: IVoteData = {
            leader: this.leader,
            players: this.players,
            playersVoted: this.actualPlayers.filter(p => !this.canVote.some(v => v.id === p.id)).map(p => p.id),
            topic: this.topic
        };

        if (this.canVote.length === 0) {
            vote_data.done = true;
            vote_data.playerVotes = this.playerVotes;
            vote_data.fakeArtist = this.fakeArtist;
            this.currentGameState = GAME_STATE.RESULTS;
            this.io.to(this.room_id).emit('show_vote_results', vote_data);
            setTimeout(() => this.reset_game_state(), 10000);
        } else {
            this.io.to(this.room_id).emit('update_votes', vote_data);
        }
    }
}
