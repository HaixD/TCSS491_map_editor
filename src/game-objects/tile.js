class Tile {
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
     * @param {number} tile
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     */
    static drawTile(tile, ctx, position) {
        const blockArgs = [position.x, position.y, 48, 48];
        switch (tile) {
            case Tile.PLAYER:
                ctx.drawImage(
                    AssetManager.getImage("images/player.png"),
                    position.x - 24,
                    position.y,
                    96,
                    96
                );
                break;
            case Tile.SLASHER:
            case Tile.SHOOTER:
            case Tile.BLOCKER:
                ctx.drawImage(
                    AssetManager.getImage("images/slasher.png"),
                    position.x - 24,
                    position.y,
                    96,
                    96
                );
                break;
            case Tile.SHOOT_PICKUP:
            case Tile.SLASH_PICKUP:
            case Tile.TELEPORT_PICKUP:
            case Tile.HEALTH_PICKUP:
                ctx.drawImage(AssetManager.getImage("images/shoot_pickup.png"), ...blockArgs);
                break;
            case Tile.AIR:
                break;
            case Tile.DIRT:
                ctx.drawImage(AssetManager.getImage("images/dirt.png"), ...blockArgs);
                break;
            case Tile.DIRT_STAIR_BL:
                ctx.drawImage(AssetManager.getImage("images/dirt_stair_BL.png"), ...blockArgs);
                break;
            case Tile.DIRT_STAIR_BR:
                ctx.drawImage(AssetManager.getImage("images/dirt_stair_BR.png"), ...blockArgs);
                break;
            case Tile.DIRT_STAIR_TL:
                ctx.drawImage(AssetManager.getImage("images/dirt_stair_TL.png"), ...blockArgs);
                break;
            case Tile.DIRT_STAIR_TR:
                ctx.drawImage(AssetManager.getImage("images/dirt_stair_TR.png"), ...blockArgs);
                break;
            default:
                throw new Error(`Received unrecognized tile: ${tile}`);
        }
    }
}
