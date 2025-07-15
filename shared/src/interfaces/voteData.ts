import { IPlayer } from "..";
export interface IVoteData {
    playersVoted: string[];
    done?: boolean;
    playerVotes?: { [playerId: string]: number; };
    fakeArtist?: IPlayer | null;
    players: IPlayer[];
    leader?: IPlayer | null;
    topic?: string;
}
