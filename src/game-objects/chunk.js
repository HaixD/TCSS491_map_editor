/** @typedef {import("../engine/types/game-object")} */
/** @typedef {import("../tile")} */

class Chunk extends GameObject {
    static TILE_SIZE = 16;
    static SIZE = Tile.SIZE * Chunk.TILE_SIZE;

    #boundary;
    /** @type {{[x: string]: {[y: string]: number}}} */
    #tiles;
    /**
     * @param {Vector} position
     */

    #buffer;
    #changed;
    /** @type {ImageBitmap | null} */
    #bitmap;
    /** @type {{ layer: boolean, showAllLayers: boolean }} */
    #GUIState;

    constructor(position) {
        super();

        this.position = position;

        this.#boundary = new Boundary(
            this.position.x,
            this.position.x + Chunk.SIZE,
            this.position.y,
            this.position.y + Chunk.SIZE
        );

        this.#tiles = {};
        this.#changed = false;
        this.#buffer = new OffscreenCanvas(Chunk.SIZE, Chunk.SIZE);
        this.#buffer.width = this.#buffer.height = Chunk.SIZE;
        this.#buffer.getContext("2d").imageSmoothingEnabled = false;
        this.#bitmap = null;
        this.#updateGUIState();
    }

    #updateGUIState() {
        this.#GUIState = {
            layer: GUI.getLayer(),
            showAllLayers: GUI.getShowAllLayersState(),
        };
    }

    #checkGUIStateChange() {
        const lastState = this.#GUIState;
        this.#updateGUIState();

        if (lastState.showAllLayers !== this.#GUIState.showAllLayers) {
            return true;
        } else if (
            this.#GUIState.showAllLayers === false &&
            lastState.layer !== this.#GUIState.layer
        ) {
            return true;
        }

        return false;
    }

    isEmpty() {
        return Object.keys(this.#tiles).length === 0;
    }

    setTile(x, y, tile) {
        this.#changed = true;

        if (tile === Tile.AIR) {
            this.#deleteTile(x, y);
            return;
        }

        if (this.#tiles[x] === undefined) {
            this.#tiles[x] = {};
        }

        this.#tiles[x][y] = tile;
    }

    applyTile(x, y, tile) {
        this.#changed = true;

        if (this.#tiles[x] === undefined) {
            this.#tiles[x] = {};
        }

        this.#tiles[x][y] = Tile.applyTile(this.#tiles[x][y] || 0, tile, GUI.getLayer());
        if (this.#tiles[x][y] === Tile.AIR) {
            this.#deleteTile(x, y);
        }
    }

    getTile(x, y) {
        return this.#tiles[x] === undefined || this.#tiles[x][y] === undefined
            ? Tile.AIR
            : this.#tiles[x][y];
    }

    *getTiles() {
        for (const [x, col] of Object.entries(this.#tiles)) {
            for (const [y, tile] of Object.entries(col)) {
                yield { x: Number(x), y: Number(y), tile };
            }
        }
    }

    getBoundary() {
        return this.#boundary;
    }

    /**
     * Draws this Game Object on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        super.draw(ctx);

        if (this.#changed || this.#checkGUIStateChange()) {
            this.#changed = false;
            const ctx = this.#buffer.getContext("2d");

            ctx.save();
            for (let { x, y, tile } of this.getTiles()) {
                x -= this.position.x;
                y -= this.position.y;

                if (GUI.getShowAllLayersState()) {
                    Tile.drawTile(tile, ctx, new Vector(x, y));
                } else {
                    let layer = 0;

                    while (true) {
                        const { quotient, remainder } = Tile.splitTileLayer(tile, 0);
                        if (quotient === 0 && remainder === 0) break;

                        tile = remainder;

                        ctx.globalAlpha = layer === GUI.getLayer() ? 1 : 0.33;
                        Tile.drawTile(quotient, ctx, new Vector(x, y));
                        layer++;
                    }
                }
            }

            ctx.restore();

            if (this.#bitmap !== null) {
                this.#bitmap.close();
            }
            this.#bitmap = this.#buffer.transferToImageBitmap();
        }

        if (this.#bitmap !== null) {
            ctx.drawImage(this.#bitmap, this.position.x, this.position.y);
        }
    }

    #deleteTile(x, y) {
        if (x in this.#tiles && y in this.#tiles[x]) {
            delete this.#tiles[x][y];
            if (Object.keys(this.#tiles[x]).length === 0) {
                delete this.#tiles[x];
            }
        }
    }
}
