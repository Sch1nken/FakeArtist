export enum UPDATE_TYPE {
    GAME_START = "game_start",
    GAME_RESET = "game_reset",
    GAME_FINISH = "game_finish",

    ADVANCE_TURN = "advance_turn",

    LEADER_SELECTED = "leader_selected",
    PLAYER_DATA = "player_data",
    TOPIC_SELECTED = "topic_selected",

    VOTE_DATA = "vote_data",
    VOTE_RESULTS = "vote_results",

    MESSAGE = "message",
    SPECTATOR_COUNT = "spectator_count",


    TURN_DRAW_DATA = "turn_draw_data",
    // Can also be used to instantly have spectators be updated
    // With the correct draw data: Just resend all
    // live_draw_data for the current turn
    LIVE_DRAW_DATA = "live_draw_data"
}