import { IPlayer } from "..";
export interface IVoteData {
    done?: boolean;
    fakeArtist?: IPlayer | null;
    leader?: IPlayer | null;
    players: IPlayer[];
    playersVoted: string[];
    playerVotes?: { [playerId: string]: number; };
    topic?: string;
}
