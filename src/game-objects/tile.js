class Tile {
    // SPECIAL [0, 0]
    static AIR = 0;

    // TILES [1, 80]
    static DIRT = 1;
    static DIRT_STAIR_BL = 2;
    static DIRT_STAIR_BR = 3;
    static DIRT_STAIR_TL = 4;
    static DIRT_STAIR_TR = 5;
    static BRICK = 6;
    static BRICK_BG = 7;
    static BRICK_BL = 8;
    static BRICK_BR = 9;
    static BRICK_TL = 10;
    static BRICK_TR = 11;
    static WOOD = 12;
    static WOOD_BG = 13;
    static WOOD_BL = 14;
    static WOOD_BR = 15;
    static WOOD_TL = 16;
    static WOOD_TR = 17;
    static LEAF = 18;
    static LEAF_BG = 19;
    static LEAF_BL = 20;
    static LEAF_BR = 21;
    static LEAF_TL = 22;
    static LEAF_TR = 23;
    static LEAF_BL_BG = 24;
    static LEAF_BR_BG = 25;
    static LEAF_TL_BG = 26;
    static LEAF_TR_BG = 27;

    // OBJECTS [81, 99]
    static PLAYER = 81;
    static SLASHER = 82;
    static SHOOTER = 83;
    static BLOCKER = 84;
    static SHOOT_PICKUP = 85;
    static SLASH_PICKUP = 86;
    static TELEPORT_PICKUP = 87;
    static HEALTH_PICKUP = 88;
    static END_PICKUP = 89;

    static #cursor = Math.pow(
        10,
        Math.trunc(Math.log10(Object.values(Tile).reduce((a, b) => Math.max(a, b)))) + 1
    );
    /** @type {{[value: string]: string}} */
    static #tileImages = {};
    static SIZE = 48;

    constructor() {
        throw new Error("Tile is a static class and should not have any instances");
    }

    static getCategory(tile) {
        if (tile >= 81) {
            return "objects";
        } else if (tile >= 0) {
            return "tiles";
        }
    }

    static applyTile(base, tile, layer) {
        const rightExtractor = Math.pow(this.#cursor, layer);
        const rightPart = base % rightExtractor;
        base = Math.trunc(base / (rightExtractor * this.#cursor));
        base *= this.#cursor;
        base += tile;
        base *= rightExtractor;
        base += rightPart;

        return base;
    }

    static getTileLayer(tile, layer) {
        const rightExtractor = Math.pow(this.#cursor, layer);
        return Math.trunc(tile / rightExtractor) % this.#cursor;
    }

    /**
     * @param {number} value
     * @param {string} imageSrc
     */
    static setImageSrc(value, imageSrc) {
        this.#tileImages[value] = imageSrc;
    }

    /**
     * @param {number} tile
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     */
    static drawTile(tile, ctx, position) {
        if (tile === Tile.AIR) return;

        const normalShape = new Vector(Tile.SIZE, Tile.SIZE);
        const largeShape = normalShape.multiply(2);

        const remaining = Math.trunc(tile / this.#cursor);
        tile %= this.#cursor;

        switch (tile % this.#cursor) {
            // HIDDEN TILES
            case Tile.AIR:
                break;
            // 2x2 TILES
            case Tile.PLAYER:
            case Tile.SLASHER:
            case Tile.SHOOTER:
                Tile.#drawImage(ctx, position, largeShape, tile);
                break;
            // UNIQUE TILES
            case Tile.BLOCKER: // SPECIAL SIZE
                Tile.#drawImage(ctx, position, new Vector(48, 96), tile);
                break;
            case Tile.SLASH_PICKUP: // PLACEHOLDER IMAGE TILES
            case Tile.TELEPORT_PICKUP:
                Tile.#drawImage(ctx, position, normalShape, "images/shoot_pickup.png");
                break;
            // 1x1 TILES
            default:
                Tile.#drawImage(ctx, position, normalShape, tile);
        }

        Tile.drawTile(remaining, ctx, position);
    }

    /**
     * @param {number} tile
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     * @param {number} layer
     */
    static drawTileLayer(tile, ctx, position, layer) {
        Tile.drawTile(Tile.getTileLayer(tile, layer), ctx, position);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     * @param {Vector} shape
     * @param {number | string} src
     */
    static #drawImage(ctx, position, shape, src) {
        const imageSrc = typeof src === "number" ? Tile.#tileImages[src] : src;
        if (imageSrc === undefined) {
            console.log(src);
            ctx.fillRect(position.x, position.y, shape.x, shape.y);
            return;
        }

        const image = AssetManager.getImage(imageSrc);
        if ("then" in image) {
            image.then(value => {
                value.onload = () => Tile.#drawImage(ctx, position, shape, imageSrc);
            });
            return;
        }

        const offset = shape.subtract(Tile.SIZE, Tile.SIZE).multiply(0.5);
        offset.y = 0;
        position = position.subtract(offset);

        ctx.drawImage(image, position.x, position.y, shape.x, shape.y);
    }
}
