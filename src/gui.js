/** @typedef {import("./game-map")} */

class GUI {
    static #selectedTile = -1;
    static #selectedTool = -1;
    static #selectedLayer = 0;
    static #toggledShowAllLayers = false;
    /** @type {Set<string>} */
    static #sections = new Set();

    /**
     * @param {HTMLElement} target
     * @param {number} tile
     */
    static selectTile(target, tile) {
        for (const element of document.querySelectorAll(
            "#right-bar > :not(:first-child) .selected"
        )) {
            element.classList.remove("selected");
        }

        target.classList.add("selected");
        GUI.#selectedTile = tile;
    }

    static selectTool(target, tool) {
        for (const element of document.querySelectorAll("#tools .tool-toggle")) {
            element.classList.remove("selected");
        }

        target.classList.add("selected");
        GUI.#selectedTool = tool;
    }

    static selectLayer(layer) {
        this.#selectedLayer = layer;
    }

    static toggleShowAllLayers(state) {
        this.#toggledShowAllLayers = state;
    }

    static getTile() {
        return GUI.#selectedTile;
    }

    static getTool() {
        return GUI.#selectedTool;
    }

    static getLayer() {
        return GUI.#selectedLayer;
    }

    static getShowAllLayersState() {
        return GUI.#toggledShowAllLayers;
    }

    static saveMapJSON() {
        const blob = new Blob([JSON.stringify(GameMap.export())], {
            type: "application/json",
        });

        const link = document.createElement("a");
        link.download = "map_export_data.json";
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    static saveMapJS() {
        const blob = new Blob([`const MAP_EXPORT_DATA = ${JSON.stringify(GameMap.export())}`], {
            type: "text/javascript",
        });

        const link = document.createElement("a");
        link.download = "map_export_data.js";
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    static loadMap() {
        /** @type {HTMLInputElement} */
        const element = document.getElementById("import-json");
        element.files[0].text().then(data => {
            switch (element.files[0].type) {
                case "application/json":
                    GameMap.import(MapExport.update(JSON.parse(data)));
                    break;
                case "application/x-javascript":
                default:
                    GameMap.import(
                        MapExport.update(
                            JSON.parse(
                                data
                                    .slice(24)
                                    .replace(/;/g, "")
                                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                                    .replace(/,\s*([\]}])/g, "$1")
                            )
                        )
                    );
            }
        });
    }

    /**
     * @param {string} type
     * @param {{name: string, value: number, imageSrc: string | undefined}}
     */
    static addToolOption(type, { name, value, imageSrc }) {
        if (!GUI.#sections.has(type)) {
            GUI.#sections.add(type);
            const toolbar = document.getElementById("transfer");
            toolbar.insertAdjacentHTML(
                "beforebegin",
                `
                <div>
                    <h1>${type}</h1>
                    <div id="${type}" class="tool-group"></div>
                </div>
            `
            );
            return this.addToolOption(type, { name, value, imageSrc });
        }

        const tiles = document.getElementById(type);

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
                console.clear();
            };

            Tile.setImageSrc(value, imageSrc);
            container.appendChild(imageElement);
        }

        tree.appendChild(container);
        tiles.appendChild(tree);
    }
}
