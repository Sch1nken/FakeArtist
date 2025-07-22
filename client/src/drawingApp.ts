import * as Pixi from 'pixi.js';

import { DrawingLayer } from './drawingLayer';

import { IPlayer } from 'shared';
import { BrushGenerator } from './brushGenerator';

export class DrawingApp {
    app: Pixi.Application;
    brushGenerator: BrushGenerator | null = null;

    domElement: HTMLElement;
    hasBackgroundAlready: boolean = false;
    readonly height: number = 512;
    layers: DrawingLayer[] = [];
    playerData: IPlayer[] = [];

    readonly width: number = 512;

    constructor(domElement: HTMLElement, playerData: IPlayer[]) {
        this.domElement = domElement;
        this.playerData = playerData;

        this.app = new Pixi.Application<Pixi.Renderer<HTMLCanvasElement>>();
    }

    addBackgroundForDownload(): void {
        // TODO: Update to pixi.js 8...
        if (!this.hasBackgroundAlready) {
            const rectangle = new Pixi.Graphics().rect(0, 0, 512, 512).fill(0xFFFFFF);
            // Why did I use lineStyle here? In pixi 8 its strokeStyle.
            // Maybe it was not needed at all?
            /*rectangle.lineStyle(0.5, 0x999999);
            rectangle.beginFill(0xFFFFFF);
            rectangle.drawRect(0, 0, 512, 512);
            rectangle.endFill();*/

            this.app.stage.addChildAt(rectangle, 0);

            this.hasBackgroundAlready = true;
        }
    }

    get(): Pixi.Application | null {
        return this.app;
    }

    async init() {
        this.app = new Pixi.Application<Pixi.Renderer<HTMLCanvasElement>>();
        await this.app.init({
            backgroundColor: 0xffffff,
            height: this.height,
            width: this.width
        });
        this.domElement.appendChild(this.app.canvas);

        this.brushGenerator = new BrushGenerator(this.app.renderer);

        /*
        this.playerData.forEach((p, idx) => {
            const renderTexture = Pixi.RenderTexture.create({ height: this.height, width: this.width });
        });
        */

        // For loop is just more convenient here...
        for (let i = 0; i < this.playerData.length * 2; i++) {
            const renderTexture = Pixi.RenderTexture.create({ height: this.height, width: this.width });
            const currentPlayer: IPlayer = this.playerData[i % this.playerData.length];
            this.layers.push(new DrawingLayer(this.app, renderTexture, this.brushGenerator, currentPlayer.persistentId, currentPlayer.playerColor, this.width, this.height, 16, 0.01));
        }
    }
}