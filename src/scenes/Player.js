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

  scene.load.spritesheet("player_attack", "assets/map/characters/main/slash_128.png", {
    frameWidth: 128,
    frameHeight: 128,
    spacing: 0,
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

  scene.anims.create({
      key: "player_attack_down",
      frames: scene.anims.generateFrameNumbers("player_attack", { 
        start: 12, 
        end: 17 
      }),
      frameRate: 10,
      repeat: 0,
  });

  scene.anims.create({
      key: "player_attack_left",
      frames: scene.anims.generateFrameNumbers("player_attack", { 
        start: 6, 
        end: 11 
      }),
      frameRate: 10,
      repeat: 0,
  });

  scene.anims.create({
      key: "player_attack_right",
      frames: scene.anims.generateFrameNumbers("player_attack", { 
        start: 18, 
        end: 23
      }),
      frameRate: 10,
      repeat: 0,
  });

  scene.anims.create({
      key: "player_attack_up",
      frames: scene.anims.generateFrameNumbers("player_attack", { 
        start: 0, 
        end: 5 
      }),
      frameRate: 10,
      repeat: 0,
  });
}