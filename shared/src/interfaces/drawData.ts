export type IDrawData = any[];

// For Full DrawData we need:
// Player / Color
// Array of CoordinatePairs (initial + delta/offset)
// Flag if data is complete?

// We need the delta to sanity check the ink used on the server side