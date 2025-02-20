/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./game-objects/user")} */

async function main() {
    document.querySelector("#tiles > *:first-child").onclick();

    await AssetManager.getImage("images/player.png");
    await AssetManager.getImage("images/slasher.png");
    await AssetManager.getImage("images/shoot_pickup.png");

    await AssetManager.getImage("images/dirt.png");
    await AssetManager.getImage("images/dirt_stair_BL.png");
    await AssetManager.getImage("images/dirt_stair_BR.png");
    await AssetManager.getImage("images/dirt_stair_TL.png");
    await AssetManager.getImage("images/dirt_stair_TR.png");

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
