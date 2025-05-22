export function loadSprites2(scene) {
  scene.load.spritesheet('player2_idle', 'assets/map/characters/main_female/thrust.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player2_walk', 'assets/map/characters/main_female/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player2_attack', 'assets/map/characters/main_female/slash_128.png', {
    frameWidth: 128,
    frameHeight: 128,
  });
  scene.load.spritesheet('player2_hurt', 'assets/map/characters/main_female/hurt.png', {
    frameWidth: 64,
    frameHeight: 64,
  });

  scene.load.audio('attack_main', 'assets/sounds/ingame/attack-main.mp3');
}

function createAnimations2(scene) {
  scene.anims.create({
    key: 'player2_idle',
    frames: scene.anims.generateFrameNumbers('player2_idle', { start: 0, end: 23 }),
    frameRate: 8,
    repeat: -1,
    yoyo: true,
  });
  scene.anims.create({
    key: 'player2_walk_down',
    frames: scene.anims.generateFrameNumbers('player2_walk', { start: 0, end: 8 }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'player2_walk',
    frames: scene.anims.generateFrameNumbers('player2_walk', { start: 27, end: 35 }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'player2_walk_up',
    frames: scene.anims.generateFrameNumbers('player2_walk', { start: 18, end: 26 }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: 'player2_attack_up',
    frames: scene.anims.generateFrameNumbers('player2_attack', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
  scene.anims.create({
    key: 'player2_attack_left',
    frames: scene.anims.generateFrameNumbers('player2_attack', { start: 6, end: 11 }),
    frameRate: 10,
    repeat: 0,
  });
  scene.anims.create({
    key: 'player2_attack_down',
    frames: scene.anims.generateFrameNumbers('player2_attack', { start: 12, end: 17 }),
    frameRate: 10,
    repeat: 0,
  });
  scene.anims.create({
    key: 'player2_attack_right',
    frames: scene.anims.generateFrameNumbers('player2_attack', { start: 18, end: 23 }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: 'player2_hurt',
    frames: scene.anims.generateFrameNumbers('player2_hurt', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
}

export function createPlayer2(scene) {
  createAnimations2(scene);

  const p2 = scene.physics.add.sprite(300, 240, 'player2_idle');
  p2.body.setSize(32, 48).setOffset(16, 16);

  p2.maxHealth = 100;
  p2.health = 100;
  p2.shieldActive = false;
  p2.isHurt = false;
  p2.isAttacking = false;
  p2.direction = 'down';

  p2.isDashing = false;
  p2.lastDashTime = 0;
  p2.dashCooldown = 500;
  p2.dashDuration = 150;
  p2.dashSpeed = 1000;

  p2.invulTime = 300;
  p2.lastHitTime = 0;

  p2.attackBox = scene.add.rectangle(0, 0, 40, 20, 0x00ff00, 0.5).setOrigin(0.5);
  p2.attackBox.setVisible(false);
  scene.physics.add.existing(p2.attackBox);
  p2.attackBox.body.enable = false;

  p2.attackSound = scene.sound.add('attack_main', { volume: 0.3 });
  scene.anims.on(Phaser.Animations.Events.ANIMATION_START, (anim, frame, sprite) => {
    if (sprite === p && anim.key.startsWith('player_attack')) p.attackSound.play();
  });

  p2.heal = function () {
    this.health = Math.min(this.health + 0.5 * this.maxHealth, this.maxHealth);
  };

  p2.activateShield = function () {
    if (this.shieldActive) return;
    this.shieldActive = true;
    this.setTint(0x00ffff);
    scene.time.delayedCall(5000, () => {
      this.shieldActive = false;
      this.clearTint();
    });
  };

  p2.takeDamage = function (dmg = 1) {
    if (this.shieldActive || scene.time.now - this.lastHitTime < this.invulTime || this.health <= 0) return;

    this.lastHitTime = scene.time.now;
    this.health = Math.max(0, this.health - dmg);

    this.isHurt = true;
    this.setVelocity(0);
    this.play('player2_hurt', true);
    this.setTintFill(0xff0000);
    scene.time.delayedCall(100, () => this.clearTint());

    this.once('animationcomplete-player2_hurt', () => {
      this.isHurt = false;
      if (this.health <= 0) {
        this.setTint(0x000000);
        scene.physics.pause();
      }
    });

    console.log('HP Player 2 →', this.health);
  };

  return p2;
}
