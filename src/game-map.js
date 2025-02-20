/** @typedef {import("./game-objects/chunk")} */
/** @typedef {import("./engine/types/boundary")} */

class GameMap {
    /** @type {{[x: string]: {[y: string]: Chunk}}} */
    static #chunks = {};

    constructor() {
        throw new Error("GameMap is a static class and should not have any instances");
    }

    static setTile(x, y, tile) {
        const chunkX = Math.floor(x / Chunk.SIZE) * Chunk.SIZE;
        const chunkY = Math.floor(y / Chunk.SIZE) * Chunk.SIZE;

        if (tile === Tile.AIR && !this.#hasChunk(chunkX, chunkY)) {
            return;
        }

        const chunk = this.#getChunk(chunkX, chunkY);
        chunk.setTile(x, y, tile);

        if (chunk.isEmpty()) {
            this.#deleteChunk(chunkX, chunkY);
            console.log(this.#chunks);
        }
    }

    static export() {
        const bounds = this.#getBounds();
        const shape = bounds
            .asShape()
            .multiply(1 / Tile.SIZE)
            .map(Math.ceil)
            .add(1, 1);
        const tiles = Array(shape.x)
            .fill(0)
            .map(() =>
                Array(shape.y)
                    .fill(0)
                    .map(() => Tile.AIR)
            );

        for (const { x, y, tile } of this.getTiles()) {
            const xIndex = Math.floor((x - bounds.left) / Tile.SIZE);
            const yIndex = Math.floor((y - bounds.top) / Tile.SIZE);
            tiles[xIndex][yIndex] = tile;
        }

        return new MapExport(bounds.top, bounds.left, tiles);
    }

    /**
     * @param {MapExport} mapExport
     */
    static import(mapExport) {
        this.clear();

        const { top, left, tiles } = mapExport;

        for (let xIndex = 0; xIndex < tiles.length; xIndex++) {
            for (let yIndex = 0; yIndex < tiles[0].length; yIndex++) {
                const x = left + xIndex * Tile.SIZE;
                const y = top + yIndex * Tile.SIZE;

                this.setTile(x, y, tiles[xIndex][yIndex]);
            }
        }
    }

    static clear() {
        for (const chunk of this.#getChunks()) {
            chunk.triggerDelete();
        }

        this.#chunks = {};
    }

    static *#getChunks() {
        for (const col of Object.values(this.#chunks)) {
            for (const chunk of Object.values(col)) {
                yield chunk;
            }
        }
    }

    static *getTiles() {
        for (const chunk of this.#getChunks()) {
            yield* chunk.getTiles();
        }
    }

    /**
     * @param {Chunk} chunk
     */
    static #addChunk(chunk) {
        this.#chunks[chunk.position.x] ||= {};
        this.#chunks[chunk.position.x][chunk.position.y] = chunk;

        GameEngine.addGameObject("tile", chunk);
    }

    /**
     * @param {number} chunkX
     * @param {number} chunkY
     */
    static #getChunk(chunkX, chunkY) {
        if (!this.#hasChunk(chunkX, chunkY)) {
            const chunk = new Chunk(new Vector(chunkX, chunkY));
            this.#addChunk(chunk);
            return chunk;
        }

        return this.#chunks[chunkX][chunkY];
    }

    static #hasChunk(chunkX, chunkY) {
        return chunkX in this.#chunks && chunkY in this.#chunks[chunkX];
    }

    static #deleteChunk(chunkX, chunkY) {
        if (this.#hasChunk(chunkX, chunkY)) {
            this.#chunks[chunkX][chunkY].triggerDelete();
            delete this.#chunks[chunkX][chunkY];
            if (Object.keys(this.#chunks[chunkX]).length === 0) {
                delete this.#chunks[chunkX];
            }
        }
    }

    static #getBounds() {
        const bounds = new Boundary(Infinity, -Infinity, Infinity, -Infinity);

        for (const { x, y } of this.getTiles()) {
            bounds.left = Math.min(bounds.left, x);
            bounds.right = Math.max(bounds.right, x);
            bounds.top = Math.min(bounds.top, y);
            bounds.bottom = Math.max(bounds.bottom, y);
        }

        return bounds;
    }
}
