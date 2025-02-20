/** @typedef {import("./tile")} */
/** @typedef {import("../engine/types/game-object")} */

class Chunk extends GameObject {
    static TILE_SIZE = 16;
    static SIZE = Tile.SIZE * Chunk.TILE_SIZE;

    #boundary;
    /** @type {{[x: string]: {[y: string]: number}}} */
    #tiles;

    /**
     * @param {Vector} position
     */
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
    }

    isEmpty() {
        return Object.keys(this.#tiles).length === 0;
    }

    setTile(x, y, tile) {
        if (tile === Tile.AIR) {
            this.#deleteTile(x, y);
        } else {
            if (this.#tiles[x] === undefined) {
                this.#tiles[x] = {};
            }

            this.#tiles[x][y] = tile;
        }
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

        for (const { x, y, tile } of this.getTiles()) {
            Tile.drawTile(tile, ctx, new Vector(x, y));
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
