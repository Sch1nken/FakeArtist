import Pixi from 'pixi.js';

import { DrawingLayer } from './drawingLayer';

import { IPlayer } from 'shared';
import { BrushGenerator } from './brushGenerator';

export class DrawingApp {
    app: Pixi.Application;
    brushGenerator: BrushGenerator;

    domElement: HTMLElement;
    hasBackgroundAlready: boolean = false;
    readonly height: number = 512;
    layers: DrawingLayer[] = [];
    playerData: IPlayer[] = [];

    readonly width: number = 512;

    constructor(domElement: HTMLElement, playerData: IPlayer[]) {
        this.domElement = domElement;
        this.playerData = playerData;

        this.app = new Pixi.Application();
        this.app.init({
            backgroundColor: 0xffffff,
            height: this.height,
            width: this.width
        });

        this.brushGenerator = new BrushGenerator(this.app.renderer);

        /*
        this.playerData.forEach((p, idx) => {
            const renderTexture = Pixi.RenderTexture.create({ height: this.height, width: this.width });
        });*/

        // For loop is just more convenient here...
        for (let i = 0; i < playerData.length * 2; i++) {
            const renderTexture = Pixi.RenderTexture.create({ height: this.height, width: this.width });
            const currentPlayer: IPlayer = playerData[i % playerData.length];
            this.layers.push(new DrawingLayer(this.app, renderTexture, this.brushGenerator, currentPlayer.persistentId, currentPlayer.playerColor, this.width, this.height, 16, 0.01));
        }

        domElement.appendChild(this.app.canvas);
    }

    addBackgroundForDownload(): void {
        // TODO: Update to pixi.js 8...
        if (!this.hasBackgroundAlready) {
            const rectangle = new Pixi.Graphics();
            rectangle.lineStyle(0.5, 0x999999);
            rectangle.beginFill(0xFFFFFF);
            rectangle.drawRect(0, 0, 512, 512);
            rectangle.endFill();

            this.app.stage.addChildAt(rectangle, 0);

            this.hasBackgroundAlready = true;
        }
    }

    get(): Pixi.Application {
        return this.app;
    }

}