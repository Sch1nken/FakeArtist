import { IPlayer } from "shared";

export class Player implements IPlayer {
  id: string;
  isSpectator: boolean = false;
  persistentId: string;
  playerColor: string;
  playerName: string;
  ready: boolean = false;
  score: number = 0;

  constructor(
    id_: string,
    persistentId_: string,
    name_: string,
    player_color_: string,
  ) {
    this.id = id_;
    this.persistentId = persistentId_;
    this.playerName = name_;
    this.playerColor = player_color_;
  }
}
