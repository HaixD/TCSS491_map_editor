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
        const blockArgs = [position.x, position.y, 48, 48];
        const normalShape = new Vector(Tile.SIZE, Tile.SIZE);
        const largeShape = normalShape.multiply(2);

        switch (tile) {
            case Tile.PLAYER:
                Tile.#drawImage(ctx, position, largeShape, tile);
                break;
            case Tile.SLASHER:
                Tile.#drawImage(ctx, position, largeShape, tile);
                break;

            case Tile.SHOOTER:
                Tile.#drawImage(ctx, position, largeShape, tile);
                break;
            case Tile.BLOCKER:
                Tile.#drawImage(ctx, position, new Vector(48, 96), tile);
                break;
            case Tile.SHOOT_PICKUP:
            case Tile.SLASH_PICKUP:
            case Tile.TELEPORT_PICKUP:
                Tile.#drawImage(ctx, position, normalShape, "images/shoot_pickup.png");
                break;
            case Tile.HEALTH_PICKUP:
                Tile.#drawImage(ctx, position, normalShape, tile);
            case Tile.AIR:
                break;
            case Tile.DIRT:
                Tile.#drawImage(ctx, position, normalShape, tile);
                break;
            case Tile.DIRT_STAIR_BL:
                Tile.#drawImage(ctx, position, normalShape, tile);
                break;
            case Tile.DIRT_STAIR_BR:
                Tile.#drawImage(ctx, position, normalShape, tile);
                break;
            case Tile.DIRT_STAIR_TL:
                Tile.#drawImage(ctx, position, normalShape, tile);
                break;
            case Tile.DIRT_STAIR_TR:
                Tile.#drawImage(ctx, position, normalShape, tile);
                break;
            default:
                throw new Error(`Received unrecognized tile: ${tile}`);
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
            return;
        }

        const image = AssetManager.getImage(imageSrc);
        if ("then" in image) {
            image.then(value => {
                value.onload = Tile.#drawImage(imageSrc);
            });
            return;
        }

        const offset = shape.subtract(Tile.SIZE, Tile.SIZE).multiply(0.5);
        offset.y = 0;
        position = position.subtract(offset);

        ctx.drawImage(image, position.x, position.y, shape.x, shape.y);
    }
}
