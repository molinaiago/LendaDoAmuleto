export function createPlayer(scene) {
    const player = scene.physics.add.sprite(240, 240, "player_idle")
    createAnimations(scene, player)
    return player
}

export function loadSprites(scene) {
    scene.load.spritesheet("player_walk", "assets/map/characters/main/walk.png", {
        frameWidth: 64,
        frameHeight: 64,
        spacing: 0,
    })

    scene.load.spritesheet("player_idle", "assets/map/characters/main/idle.png", {
        frameWidth: 64,
        frameHeight: 64,
        spacing: 0,
    })

    scene.load.spritesheet("player_walk_up", "assets/map/characters/main/walk.png", {
        frameWidth: 64,
        frameHeight: 64,
      });

    scene.load.spritesheet("player_walk_down", "assets/map/characters/main/walk.png", {
        frameWidth: 64,
        frameHeight: 64,
    });
}

export function createAnimations(scene, player) {
    scene.anims.create({
        key: "player_idle",
        frames: scene.anims.generateFrameNames("player_idle", {
          start: 0,
          end: 1,
        }),
        frameRate: 2,
        repeat: -1,
        yoyo: true,
      });

      scene.anims.create({
        key: "player_walk",
        frames: scene.anims.generateFrameNames("player_walk", {
            start: 27,
            end: 35, 
        }),
        frameRate: 8,
        repeat: -1,
    });

    scene.anims.create({
        key: "walk_up",
        frames: scene.anims.generateFrameNames("player_walk_up", {
          start: 18,
          end: 26
        }),
        frameRate: 8,
        repeat: -1
      });
    
      scene.anims.create({
        key: "walk_down",
        frames: scene.anims.generateFrameNames("player_walk_down", {
          start: 0,
          end: 8
        }),
        frameRate: 8,
        repeat: -1
      });
}
 
