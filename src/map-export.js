/** @typedef {import("./game-objects/tile")} */

class MapExport {
    /**
     * @param {number} top
     * @param {number} left
     * @param {number[][]} tiles tiles[x][y] = tile
     */
    constructor(top, left, tiles) {
        this.version = 3;
        this.top = top;
        this.left = left;
        this.tiles = tiles;
    }

    static update(json) {
        if (!("version" in json)) {
            json = MapExport.#updateV0(json);
        }
        if (json.version === 1) {
            json = MapExport.#updateV1(json);
        }
        if (json.version === 2) {
            json = MapExport.#updateV2(json);
        }

        return json;
    }

    static #updateV0(json) {
        const backgrounds = new Set([Tile.BRICK_BG, Tile.WOOD_BG, Tile.LEAF_BG]);

        json.version = 1;

        for (let x = 0; x < json.tiles.length; x++) {
            for (let y = 0; y < json.tiles[x].length; y++) {
                let tile = json.tiles[x][y];

                // migrate tile values
                if (tile < 0) {
                    tile = 80 + Math.abs(tile);
                }

                // apply new layers
                let layer = 1;
                if (backgrounds.has(tile)) {
                    layer = 0;
                } else if (Tile.getCategory(tile) === "objects") {
                    layer = 2;
                }

                json.tiles[x][y] = Tile.applyTile(0, tile, layer);
            }
        }

        return json;
    }

    static #updateV1(json) {
        json.version = 2;

        for (let x = 0; x < json.tiles.length; x++) {
            for (let y = 0; y < json.tiles[x].length; y++) {
                let tile = json.tiles[x][y];

                // move layer 2 objects to layer 3
                const tileLayer2 = Tile.getTileLayer(tile, 2);
                if (Tile.getCategory(tileLayer2) === "objects") {
                    tile = Tile.applyTile(tile, Tile.AIR, 2);
                    tile = Tile.applyTile(tile, tileLayer2, 3);
                }

                // move grass and flowers from layer 0 or 1 to layer 2
                const tileLayer0 = Tile.getTileLayer(tile, 0);
                const tileLayer1 = Tile.getTileLayer(tile, 1);
                if (tileLayer0 === Tile.GRASS || tileLayer0 === Tile.FLOWER) {
                    tile = Tile.applyTile(tile, Tile.AIR, 0);
                    tile = Tile.applyTile(tile, tileLayer0, 2);
                } else if (tileLayer1 === Tile.GRASS || tileLayer1 === Tile.FLOWER) {
                    tile = Tile.applyTile(tile, Tile.AIR, 1);
                    tile = Tile.applyTile(tile, tileLayer1, 2);
                }

                json.tiles[x][y] = tile;
            }
        }

        return json;
    }

    static #updateV2(json) {
        json.version = 3;

        for (let x = 0; x < json.tiles.length; x++) {
            for (let y = 0; y < json.tiles[x].length; y++) {
                let tile = json.tiles[x][y];
                const layer1 = Tile.getTileLayer(tile, 1);
                switch (layer1) {
                    case Tile.TERRAIN_BG_BL:
                    case Tile.TERRAIN_BG_BR:
                    case Tile.TERRAIN_BG_TL:
                    case Tile.TERRAIN_BG_TR:
                        tile = Tile.applyTile(tile, layer1 - 30, 1);
                        tile = Tile.applyTile(tile, Tile.TERRAIN_BG, 0);
                        break;
                    case Tile.BRICK_BG_BL:
                    case Tile.BRICK_BG_BR:
                    case Tile.BRICK_BG_TL:
                    case Tile.BRICK_BG_TR:
                        tile = Tile.applyTile(tile, layer1 - 4, 1);
                        tile = Tile.applyTile(tile, Tile.LEAF_BG, 0);
                        break;
                    case Tile.BRICK_BL:
                    case Tile.BRICK_BR:
                    case Tile.BRICK_TL:
                    case Tile.BRICK_TR:
                        tile = Tile.applyTile(tile, Tile.BRICK_BG, 0);
                        break;
                }

                json.tiles[x][y] = tile;
            }
        }

        return json;
    }
}
