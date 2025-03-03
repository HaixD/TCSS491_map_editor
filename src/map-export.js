class MapExport {
    /**
     * @param {number} top
     * @param {number} left
     * @param {number[][]} tiles tiles[x][y] = tile
     */
    constructor(top, left, tiles) {
        this.version = 1;
        this.top = top;
        this.left = left;
        this.tiles = tiles;
    }

    static update(json) {
        if (!("version" in json)) {
            json = MapExport.#updateV0(json);
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
                } else if (tile >= 81) {
                    layer = 2;
                }
                json.tiles[x][y] = Tile.applyTile(0, tile, layer);
            }
        }

        return json;
    }
}
