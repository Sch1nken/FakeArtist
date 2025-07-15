"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomCodeGenerator = void 0;
const ROOM_CHARS = 'ABCDEFGHJKLMOPRSTUWXYZ';
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
class RoomCodeGenerator {
    randomId() {
        let out = '';
        for (let i = 0; i < 4; i++) {
            out += ROOM_CHARS[randomInt(0, ROOM_CHARS.length - 1)];
        }
        return out;
    }
}
exports.RoomCodeGenerator = RoomCodeGenerator;
