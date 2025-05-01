export function createPlayer(scene) {
  const player = scene.physics.add.sprite(240, 240, "player_idle");
  createAnimations(scene, player);

  player.maxHealth = 1000;
  player.health = 500
  player.shieldActive = false;

  player.heal = function () {
      if (this.health < this.maxHealth) {
          this.health++;
          console.log(`Curado! Vida atual: ${this.health}/${this.maxHealth}`);
      } else {
          console.log("Vida já está cheia.");
      }
  };

  player.activateShield = function () {
      if (this.shieldActive) return;
      this.shieldActive = true;
      console.log("Escudo ativado!");

      this.setTint(0x00ffff);

      this.scene.time.delayedCall(5000, () => {
          this.shieldActive = false;
          this.clearTint();
          console.log("Escudo desativado!");
      });
  };

  return player;
}

export function loadSprites(scene) {
  scene.load.spritesheet("player_walk", "assets/map/characters/main/walk.png", {
      frameWidth: 64,
      frameHeight: 64,
  });

  scene.load.spritesheet("player_idle", "assets/map/characters/main/idle.png", {
      frameWidth: 64,
      frameHeight: 64,
  });

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
  });
}

export function createAnimations(scene) {
  scene.anims.create({
      key: "player_idle",
      frames: scene.anims.generateFrameNumbers("player_idle", { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1,
      yoyo: true,
  });

  scene.anims.create({
      key: "player_walk",
      frames: scene.anims.generateFrameNumbers("player_walk", { start: 27, end: 35 }),
      frameRate: 8,
      repeat: -1,
  });

  scene.anims.create({
      key: "walk_up",
      frames: scene.anims.generateFrameNumbers("player_walk_up", { start: 18, end: 26 }),
      frameRate: 8,
      repeat: -1,
  });

  scene.anims.create({
      key: "walk_down",
      frames: scene.anims.generateFrameNumbers("player_walk_down", { start: 0, end: 8 }),
      frameRate: 8,
      repeat: -1,
  });

  scene.anims.create({
      key: "player_attack_down",
      frames: scene.anims.generateFrameNumbers("player_attack", { start: 12, end: 17 }),
      frameRate: 10,
      repeat: 0,
  });

  scene.anims.create({
      key: "player_attack_left",
      frames: scene.anims.generateFrameNumbers("player_attack", { start: 6, end: 11 }),
      frameRate: 10,
      repeat: 0,
  });

  scene.anims.create({
      key: "player_attack_right",
      frames: scene.anims.generateFrameNumbers("player_attack", { start: 18, end: 23 }),
      frameRate: 10,
      repeat: 0,
  });

  scene.anims.create({
      key: "player_attack_up",
      frames: scene.anims.generateFrameNumbers("player_attack", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0,
  });
}
