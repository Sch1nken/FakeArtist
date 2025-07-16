// S -> C = Server sends to client
// Everything else is used for clients sending to the server

export enum UPDATE_TYPE {
    GAME_START = "game_start", // S -> C
    GAME_RESET = "game_reset", // S -> C
    GAME_FINISH = "game_finish", // S -> C

    ADVANCE_TURN = "advance_turn", // S -> C
    TURN_FINISHED = "turn_finished",

    DRAWING_START = "drawing_start", // S -> C

    LEADER_SELECTED = "leader_selected", // S -> C
    PLAYER_DATA = "player_data",
    PLAYER_READY = "player_ready",
    TOPIC_SELECTED = "topic_selected",
    TOPIC_ERROR = "topic_error", // S -> C

    VOTE_DATA = "vote_data", // S -> C
    VOTE_FOR_PLAYER = "vote_for_player",
    VOTE_ERROR = "vote_error", // S -> C
    VOTE_RESULTS = "vote_results", // S -> C

    MESSAGE = "message", // S -> C
    SPECTATOR_COUNT = "spectator_count", // S -> C


    TURN_DRAW_DATA = "turn_draw_data", // S -> C
    // Can also be used to instantly have spectators be updated
    // With the correct draw data: Just resend all
    // live_draw_data for the current turn
    LIVE_DRAW_DATA = "live_draw_data", // TECHNICALLY BOTH!

    JOIN_ROOM = "join_room",
    ROOM_ERROR = "room_error", // S -> C
    CREATE_ROOM = "create_room",

    CONNECTION = "connection",
    DISCONNECT = "disconnect"
}