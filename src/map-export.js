class MapExport {
    /**
     * @param {number} top
     * @param {number} left
     * @param {number[][]} tiles
     */
    constructor(top, left, tiles) {
        this.version = 1;
        this.top = top;
        this.left = left;
        this.tiles = tiles;
    }
}
