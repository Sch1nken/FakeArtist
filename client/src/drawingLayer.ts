import Pixi from 'pixi.js';
import { BrushGenerator } from './brushGenerator';
import { SpritePool } from './spritePool';
import { Point } from 'shared';

export class DrawingLayer {
    app: Pixi.Application;
    brushGenerator: BrushGenerator;
    brushSize: number;
    brushSmoothing: number;
    brushTexture: Pixi.RenderTexture;
    drawBuffer: Pixi.Container = new Pixi.Container();
    drawColor: number[];
    drawingStarted: boolean = false;
    finishedPaintingCb: CallableFunction = () => { };
    height: number;
    inkUsed: number = 0.0;
    lastPosition: Point = new Point(0, 0);
    lifted: boolean = false;
    livePaintProgressCb: CallableFunction = () => { };
    readonly maxInk: number = 1000;
    persistentPlayerId: string;
    renderTexture: Pixi.RenderTexture;
    sprite: Pixi.Sprite;
    spritePool: SpritePool = new SpritePool();
    width: number;

    constructor(app: Pixi.Application, renderTexture: Pixi.RenderTexture, brushGenerator: BrushGenerator, playerId: string, color: string, width: number, height: number, brushSize: number, brushSmoothing: number) {
        this.app = app;
        this.renderTexture = renderTexture;
        this.brushGenerator = brushGenerator;
        this.persistentPlayerId = playerId;
        this.drawColor = this.hexToRgb(color);

        this.width = width;
        this.height = height;

        this.brushSize = brushSize;
        this.brushSmoothing = brushSmoothing;

        this.sprite = new Pixi.Sprite(this.renderTexture);
        this.sprite.width = this.width;
        this.sprite.height = this.height;

        this.sprite.eventMode = 'none';
        this.app.stage.addChildAt(this.sprite, 0);

        this.brushTexture = this.brushGenerator.get(this.brushSize, this.drawColor, this.brushSmoothing);

        /*const onDown = (e: Event) => {
            const position = this.sprite.toLocal(e.data.global);
        };*/

        this.sprite.on('mousedown', this.onDown);
        this.sprite.on('touchstart', this.onDown);

        this.sprite.on('mouseup', this.onUp);
        this.sprite.on('touchend', this.onUp);

        this.sprite.on('mousemove', this.onMove);
        this.sprite.on('touchmove', this.onMove);
    }

    disable() {
        this.sprite.eventMode = 'none';
    }


    drawPoint(point: Point) {
        const sprite = this.spritePool.get();
        sprite.x = point.x;
        sprite.y = point.y;
        sprite.texture = this.brushTexture;

        // Probably not necessary
        //sprite.blendMode = Pixi.Blend

        this.drawBuffer.addChild(sprite);
    }

    drawPointLine(oldPos: Point, newPos: Point, force: boolean = false) {
        if (this.lifted) {
            return;
        }

        const delta = {
            x: oldPos.x - newPos.x,
            y: oldPos.y - newPos.y
        };

        const deltaLength = Math.sqrt(delta.x ** 2 + delta.y ** 2);
        this.inkUsed += deltaLength;

        if (!force) {
            this.livePaintProgressCb(oldPos, newPos);
        }

        if (this.inkUsed >= this.maxInk) {
            this.lifted = true;
            this.drawingStarted = false;
            if (!force) {
                this.finishedPaintingCb();
            }

            return;
        }

        this.drawPoint(newPos);

        if (deltaLength >= this.brushSize / 8) {
            // Draw sub-points, otherwise our line would not be continouus
            const additionalPoints = Math.ceil(deltaLength / (this.brushSize / 8));

            for (let i = 1; i < additionalPoints; i++) {
                const pos = new Point(
                    newPos.x + delta.x * (i / additionalPoints),
                    newPos.y + delta.y * (i / additionalPoints)
                );

                this.drawPoint(pos);
            }

        }
    }

    enable() {
        this.sprite.eventMode = 'static';
    }

    getPaintPercentage(): number {
        return Math.min(this.inkUsed / this.maxInk, 1.0);
    }


    hexToRgb(hex: string): number[] {
        const res = hex.match(/[a-f0-9]{2}/gi);
        return res && res.length === 3 ? res.map(function (v) {
            return parseInt(v, 16) / 255;
        }) :
            [0, 0, 0];
    }


    onDown(e: Pixi.FederatedPointerEvent) {
        const position = this.sprite.toLocal(e.global);

        this.lastPosition = position;
        this.drawingStarted = true;
    }

    onMove(e: Pixi.FederatedPointerEvent) {
        const position = this.sprite.toLocal(e.global);

        if (this.drawingStarted) {
            this.drawPointLine(this.lastPosition, position);
        }

        this.lastPosition = position;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUp(_e: Pixi.FederatedPointerEvent) {
        this.lifted = true;
        this.drawingStarted = false;
    }

    renderPoints() {
        this.app.renderer.render({
            container: this.drawBuffer,
            target: this.renderTexture,
        });

        this.drawBuffer.children = [];

        this.spritePool.reset();
    }

    setFinishedPaintingCallback(callback: CallableFunction) {
        this.finishedPaintingCb = callback;
    }

    setLivePaintProgressCallback(callback: CallableFunction) {
        this.livePaintProgressCb = callback;
    }

}