# Hai's Map Editor

The maps made by this editor are intended for another project found at: https://github.com/JustSomeGuy80/TCSS491GP

---

This map editor is for creating and exporting game maps in the form of a 2D array.

# Table of Contents

1. [Getting Started](#getting-started)
2. [Using the Export](#using-the-export)
3. [Making Automatic Migrations](#making-automatic-migrations)
4. [Warning](#warning)

# Getting Started

To start using the exact map editor that was used in this [game](https://github.com/JustSomeGuy80/TCSS491GP), download the repository and open index.html (or start a live server). You will see that the game has 2 different types of tiles ("Tiles" and "Objects"). The tiles and tile sections can all be customized to your needs.

## Introduction to Tiles

Internally, every tile is just a number. And once exported, every tile is a number within a 2D array. This means that each unique tile is assigned a unique value, this value is determined by you. The exception is 0 which is reserved by the editor to represent an empty tile.

## Customizing the Map Editor

Your game may want to use a completely different set of tiles and you may want to use different section names.

### Resetting Migrations

1. Navigate to class `MapExport` in /src/map-export.js
2. Remove all if statements in `MapExport.update(json)`
3. Set the version to 0 in `MapExport.constructor(top, left, tiles)`
4. Remove the functions `MapExport.#updateV0(json)`, `MapExport.#updateV1(json)`, `MapExport.#updateV2(json)`

Result:

```JavaScript
class MapExport {
    // ...
    constructor(top, left, tiles) {
        this.version = 0;
        // ...
    }

    static update(json) {
        return json;
    }
}

```

### Removing All Tiles

1. Navigate to class `Tile` in /src/tile.js
2. delete all static members of `Tile` that isn't air (everything under the comment `// Tiles [1, 80]` and above `static #precision = ...`). Feel free to remove the unhelpful comments too. When done, all private members, `SIZE`, and `AIR` should be the only members that remain.
3. Navigate to `Tile.drawTile(tile, ctx, position)` in /src/tile.js
4. In the switch statement, remove all cases aside from `case Tile.AIR:` and `default:`

Result:

```JavaScript
class Tile {
    // SPECIAL [0, 0]
    static AIR = 0;

    // ... new tiles go here

    static #precision = Tile.#getDigits(Object.values(Tile).reduce((a, b) => Math.max(a, b)));
    // ...
}
```

### Removing All Sections

1. Navigate to method `Tile.getCategory(tile)` in /src/tile.js
2. Update the conditional statements to fit your needs. Currently, all tile values at or above 81 are going to be put under an "Objects" section, and everything between 0 and 80 (inclusive) will be put under "tiles". If you don't know, replace the conditional statement (if ... and else if ...) with `return tiles` so that **everything** is put under a tiles section. Note that the return value of `Tile.getCategory(tile)` is a **lowercase string** which is the name of your section.

Result:

```JavaScript
class Tile {
    // ...
    static getCategory(tile) {
        return "tiles";

        throw new Error(`Unrecognized tile: ${tile}`);
    }
    // ...
}
```

### Adding tiles

1. Navigate to class `Tile` in /src/tile.js
2. Above the `#precision` member, add a new static member (`Tile` will break if you define any tile below it). The name should be all uppercase, and it should match the corresponding image file name (excluding the file extension). For example, if you have an image "terrain_bg_tl.png", the static member should be `static TERRAIN_BG_TL = 1`. The value can be any unused number (try to choose a number as close to 0 as possible, using too many digits will break how layers work).
3. Navigate to the folder /images
4. Put your image in there (make sure the entire file name is lowercase). If you are following the example, the path of the image in step 2 should be "images/terrain_bg_tl".
5. If you are satisfied with your tile being displayed as a 1x1 tile, then you're done. Otherwise, navigate to `Tile.drawTile(tile, ctx, position)` in /src/tile.js
6. add a case for your tile (for the example it would be `case Tile.TERRAIN_BG_TL:`), and use `Tile.#drawImage(ctx, position, [DESIRED SHAPE], layer)` to customize the shape. I recommend replacing `[DESIRED SHAPE]` with `largeShape` but you can use any shape you want. Either replace `[DESIRED SHAPE]` with `normalShape.multiply(x)` (where `x` is any number greater than 0), or `new Vector(a, b)` (where `a` and `b` are any number greater than 0) if you want to choose the exact number of pixels.

-   Everything will still work if a tile is not given an image. In such cases, the tile is rendered as a 1x1 black tile.

Result:

```JavaScript
class Tile {
    // ...
    static TERRAIN_BG_TL = 9999;
    static #precision = Tile.#getDigits(Object.values(Tile).reduce((a, b) => Math.max(a, b)));
    // ...

    static drawTile(tile, ctx, position) {
        // ...
        for (const layer of Tile.iterate(tile)) {
            switch (layer) {
                // HIDDEN TILES
                case Tile.AIR:
                    break;
                // CUSTOM TILES
                case Tile.TERRAIN_BG_TL:
                    Tile.#drawImage(ctx, position, new Vector(48 * 4, 48 * 2), layer);
                    break;
                // 1x1 TILES
                default:
                    Tile.#drawImage(ctx, position, normalShape, layer);
            }
        }
    }

    // ...
}
```

# Using the Export

If you're unfamilar with how things work, you should use the "Download JS" option. Import the .js file in your project and obtain the data through the variable `MAP_EXPORT_DATA.tiles`.

-   To get a tile (all layers) you use indices (`MAP_EXPORT_DATA.tiles[xIndex][yIndex]`).
    -   The indices are not positions. To get the position of a tile you need to multiply the x and y indices (`xPosition = xIndex * Tile.SIZE`, `yPosition = yIndex * Tile.SIZE`).
    -   The position represents the "top left" or start of your tile. Add another `tile.SIZE` (`xEnd = xPosition + Tile.SIZE`, `yEnd = yPosition + Tile.SIZE`) to get the "bottom right" or end of your tile.
-   To get a specific layer of a tile, you use `Tile.getTileLayer(tile, layer)`. The layer 0 is at the very back and layer 1 is just in front of it. Currently, layer 3 is the very front.
-   To iterate through a tile from layer 0 to n (currently 3), use `Tile.iterate(tile)`.
-   To draw a tile (and all of its layers) use `Tile.drawTile(tile, ctx, position)`.

## Bonus Information

-   The number of digits which represents 1 layer is based on the **highest tile value**. This number is represented with the member `#precision`
-   `splitTileLayer(tile, layer)` separates a tile into a quotient (current layer value) and remainder (every other layer above current). If you have a precision of 1 and your tile is `abcde` (each letter represents a layer/digit), splitting it at `layer=2` yields `quotient=c`, `remainder=ab`.
-   `Tile.applyTile(base, tile, layer)` sets the layer of a tile at a given layer.

# Making Automatic Migrations

There may be times when you decide to change a tile value to another, or convert 1 tile value into 2 values, each in different layers. These changes will break old exports. Automatic migrations allow you to take in imported data, and interact with each value before the imported data is used in the map editor.

In `MapEditor.update(json)`, you can write your own way of updating the json (`json` is the json string of a `MapExport` object). You first want to check `json.version` to know which version of an import you're updating. And then you will iterate each tile in `json.tiles`, modifying the array as you go. The functions shown in the [using the export](#bonus-information) section should help a lot. Make sure that after you update the function, you increment the version member in `MapExport.constructor` by 1 to avoid repeated updates.

# Warning

-   **Prettified** exported files are not guaranteed to be imported correctly. Ideally you should leave export files as is.
-   If you encounter unexpected black tiles and you're confident you did everything correctly, it is due to floating point errors caused by high tile values. Try to use the lowest layer you can to avoid this (it may still occur anyways if your unique tile values are too high).
