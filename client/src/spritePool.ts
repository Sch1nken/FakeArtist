import * as Pixi from 'pixi.js';

export class SpritePool {
    index: number;
    sprites: Pixi.Sprite[];

    constructor() {
        this.sprites = [];
        this.index = 0;
    }

    destroy() {
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].destroy();
        }
    }

    get() {
        if (this.index < this.sprites.length) {
            return this.sprites[this.index++];
        }

        const sprite = new Pixi.Sprite(Pixi.Texture.EMPTY);
        sprite.anchor.set(0.5);
        this.sprites.push(sprite);

        return sprite;
    }

    reset() {
        this.index = 0;
    }
}
