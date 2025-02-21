/** @typedef {import("./game-map")} */

class GUI {
    static #selectedTile = Tile.AIR;

    /**
     * @param {HTMLElement} target
     * @param {number} tile
     */
    static selectTile(target, tile) {
        for (const element of document.querySelectorAll("#tiles .tool-toggle")) {
            element.classList.remove("selected");
        }
        for (const element of document.querySelectorAll("#objects .tool-toggle")) {
            element.classList.remove("selected");
        }

        target.classList.add("selected");

        this.#selectedTile = tile;
    }

    static getTile() {
        return GUI.#selectedTile;
    }

    static saveMap() {
        const blob = new Blob([JSON.stringify(GameMap.export())], {
            type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "map.json";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    static loadMap() {
        /** @type {HTMLInputElement} */
        const element = document.getElementById("import-json");
        element.files[0].text().then(json => {
            GameMap.import(JSON.parse(json));
        });
    }

    /**
     * @param {"tile" | "object"} type
     * @param {{name: string, value: number, imageSrc: string | undefined}}
     */
    static addToolOption(type, { name, value, imageSrc }) {
        const tiles = document.getElementById(`${type}s`);

        const tree = document.createDocumentFragment();
        const container = document.createElement("div");
        container.setAttribute("class", "tool-toggle");
        container.onclick = () => GUI.selectTile(container, value);
        if (imageSrc === undefined) {
            container.appendChild(document.createTextNode(name));
        } else {
            const imageElement = new Image(1, 1);
            imageElement.src = imageSrc;
            imageElement.alt = name;
            imageElement.onerror = () => {
                container.removeChild(imageElement);
                container.appendChild(document.createTextNode(name));
                Tile.setImageSrc(value, undefined);
            };

            Tile.setImageSrc(value, imageSrc);
            container.appendChild(imageElement);
        }

        tree.appendChild(container);
        tiles.appendChild(tree);
    }
}
