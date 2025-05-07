export function loadSprites(scene) {
  scene.load.spritesheet('player_idle', 'assets/map/characters/main/idle.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player_walk', 'assets/map/characters/main/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player_attack', 'assets/map/characters/main/slash_128.png', {
    frameWidth: 128,
    frameHeight: 128,
  });
  scene.load.spritesheet('player_hurt', 'assets/map/characters/main/hurt.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.audio('attack_main', 'assets/sounds/ingame/attack-main.mp3');
}

function createAnimations(scene) {
  scene.anims.create({
    key: 'player_idle',
    frames: scene.anims.generateFrameNumbers('player_idle', { start: 0, end: 1 }),
    frameRate: 2,
    repeat: -1,
    yoyo: true,
  });

  scene.anims.create({
    key: 'player_walk',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: 27, end: 35 }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: 'walk_up',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: 18, end: 26 }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: 'walk_down',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: 0, end: 8 }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: 'player_attack_up',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: 'player_attack_left',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 6, end: 11 }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: 'player_attack_down',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 12, end: 17 }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: 'player_attack_right',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 18, end: 23 }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: 'player_hurt',
    frames: scene.anims.generateFrameNumbers('player_hurt', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
}

export function createPlayer(scene) {
  createAnimations(scene);
  const p = scene.physics.add.sprite(240, 240, 'player_idle');
  p.body.setSize(32, 48).setOffset(16, 16);

  p.maxHealth = 100;
  p.health = 100;
  p.shieldActive = false;
  p.isHurt = false;
  p.isAttacking = false;
  p.direction = 'down';

  p.isDashing = false;
  p.lastDashTime = 0;
  p.dashCooldown = 500;
  p.dashDuration = 150;
  p.dashSpeed = 1000;

  p.attackBox = scene.add.rectangle(0, 0, 40, 20, 0xff0000, 0.5).setOrigin(0.5);
  p.attackBox.setVisible(false);
  scene.physics.add.existing(p.attackBox);
  p.attackBox.body.enable = false;

  p.attackSound = scene.sound.add('attack_main', { volume: 0.3 });
  scene.anims.on(Phaser.Animations.Events.ANIMATION_START, (anim, frame, sprite) => {
    if (sprite === p && anim.key.startsWith('player_attack')) {
      p.attackSound.play();
    }
  });

  p.heal = function () {
    this.health = this.maxHealth;
  };

  p.activateShield = function () {
    if (this.shieldActive) return;
    this.shieldActive = true;
    this.setTint(0x00ffff);
    scene.time.delayedCall(5000, () => {
      this.shieldActive = false;
      this.clearTint();
    });
  };

  p.takeDamage = function (d = 1) {
    if (this.shieldActive || this.isHurt || this.health <= 0) return;
    this.health = Math.max(0, this.health - d);
    this.isHurt = true;
    this.play('player_hurt', true);
    this.setTintFill(0xff0000);
    scene.time.delayedCall(100, () => this.clearTint());
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isHurt = false;
      if (this.health > 0) this.play('player_idle', true);
      else {
        this.setTint(0x000000);
        scene.physics.pause();
      }
    });
  };

  return p;
}
