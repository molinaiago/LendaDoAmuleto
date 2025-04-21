export function createGoblin(scene) {
    const goblin = scene.physics.add.sprite(200, 200, "goblin_run")
    createGoblinAnimations(scene)
    goblin.anims.play("goblin_run", true);
    return goblin;
}

export function loadGoblinSprites(scene) {
    scene.load.spritesheet("goblin_run", "assets/map/characters/goblin/walk.png", {
        frameWidth: 64,
        frameHeight: 64,
    });
}

export function createGoblinAnimations(scene) {
    scene.anims.create({
        key: "goblin_run",
        frames: scene.anims.generateFrameNames("goblin_run", {
            start: 0,
            end: 5,
        }),
        frameRate: 4,
        repeat: -1,
    });
}


