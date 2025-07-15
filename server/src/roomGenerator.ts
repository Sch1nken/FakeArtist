const ROOM_CHARS = 'ABCDEFGHJKLMOPRSTUWXYZ';

function randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

export class RoomCodeGenerator {
    randomId(): string {
        let out = '';
        for (let i = 0; i < 4; i++) {
            out += ROOM_CHARS[randomInt(0, ROOM_CHARS.length - 1)];
        }
        return out;
    }
}
