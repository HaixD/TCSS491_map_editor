/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./game-objects/user")} */

async function main() {
    for (const [key, value] of Object.entries(Tile)) {
        if (key === "SIZE") continue;

        GUI.addToolOption(Tile.getCategory(value), {
            name: key.slice(0, 3),
            value,
            imageSrc: `images/${key.toLowerCase()}.png`,
        });
    }

    document.querySelector("#tiles > *:first-child").onclick();
    document.querySelector("#tools > *:first-child").onclick();

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    GameEngine.init(ctx);

    ctx.imageSmoothingEnabled = false;
    ctx.translate(-0.5, -0.5);

    GameEngine.createScene("main", scene => {
        // make game objects
        const user = new User(
            new InstanceVector(Chunk.SIZE / 2, Chunk.SIZE / 2),
            new Vector(-canvas.width / 2, -canvas.height / 2)
        );

        scene.addLayer("ui");
        scene.addLayer("tile");
        scene.addLayer("user");

        scene.addGameObject("user", user);
        scene.addGameObject("ui", new GridUI());

        scene.setOffset(user.cameraPosition);
    });

    // start
    GameEngine.start();
}

main();
