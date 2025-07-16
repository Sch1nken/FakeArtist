import { CoordinatePair } from "./coordinatePair";

export type DrawPath = {
    points: CoordinatePair[];
};

// For Full DrawData we need:
// Player / Color
// Array of CoordinatePairs (initial + delta/offset)
// Flag if data is complete?

// But array of coordinatepairs should be enough since we have an array of an array of coords.
// So the top level index is turn number -> corresponds to player color for that turn?


// We need the delta to sanity check the ink used on the server side