export function createEsqueleto(scene) {
    const esqueleto = scene.physics.add.sprite(200, 200, "esqueleto_walk")
    createEsqueletoAnimations(scene)
    esqueleto.anims.play("esqueleto_walk", true);
    return esqueleto;
}

export function loadEsqueletoSprites(scene) {
    scene.load.spritesheet("esqueleto_walk", "assets/map/characters/esqueleto/walk.png", {
        frameWidth: 64,
        frameHeight: 64,
    });
}

export function createEsqueletoAnimations(scene) {
    scene.anims.create({
        key: "esqueleto_walk",
        frames: scene.anims.generateFrameNames("esqueleto_walk", {
            start: 0,
            end: 10,
        }),
        frameRate: 4,
        repeat: -1,
    });
}


