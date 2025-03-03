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
        json.version = 1;

        for (let x = 0; x < json.tiles.length; x++) {
            for (let y = 0; y < json.tiles[x].length; y++) {
                const tile = json.tiles[x][y];
                if (tile < 0) {
                    json.tiles[x][y] = 80 + Math.abs(tile);
                }
            }
        }

        return json;
    }
}
