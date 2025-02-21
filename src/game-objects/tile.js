class Tile {
    /** @type {{[value: string]: string}} */
    static #TileImages = {};

    static SIZE = 48;

    static PLAYER = -1;
    static SLASHER = -2;
    static SHOOTER = -3;
    static BLOCKER = -4;

    static SHOOT_PICKUP = -5;
    static SLASH_PICKUP = -6;
    static TELEPORT_PICKUP = -7;

    static HEALTH_PICKUP = -8;

    static AIR = 0;
    static DIRT = 1;
    static DIRT_STAIR_BL = 2;
    static DIRT_STAIR_BR = 3;
    static DIRT_STAIR_TL = 4;
    static DIRT_STAIR_TR = 5;

    constructor() {
        throw new Error("Tile is a static class and should not have any instances");
    }

    /**
     * @param {number} value
     * @param {string} imageSrc
     */
    static setImageSrc(value, imageSrc) {
        this.#TileImages[value] = imageSrc;
    }

    /**
     * @param {number} tile
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     */
    static drawTile(tile, ctx, position) {
        const normalShape = new Vector(Tile.SIZE, Tile.SIZE);
        const largeShape = normalShape.multiply(2);

        switch (tile) {
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
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     * @param {Vector} shape
     * @param {number | string} src
     */
    static #drawImage(ctx, position, shape, src) {
        const imageSrc = typeof src === "number" ? Tile.#TileImages[src] : src;
        if (imageSrc === undefined) {
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
