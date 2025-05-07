export function loadGoblinSprites(scene) {
  scene.load.spritesheet('goblin_idle', 'assets/map/characters/goblin/idle.png', { frameWidth: 64, frameHeight: 64 });
  scene.load.spritesheet('goblin_run', 'assets/map/characters/goblin/walk.png', { frameWidth: 64, frameHeight: 64 });
  scene.load.spritesheet('goblin_attack', 'assets/map/characters/goblin/slash_128.png', {
    frameWidth: 128,
    frameHeight: 128,
  });
  scene.load.spritesheet('goblin_hurt', 'assets/map/characters/goblin/hurt.png', { frameWidth: 64, frameHeight: 64 });
  scene.load.audio('attack_goblin', 'assets/sounds/ingame/attack-goblin.mp3');
}

export function createGoblin(scene) {
  const g = scene.physics.add.sprite(200, 200, 'goblin_run').setSize(32, 40).setOffset(16, 24);

  g.attackSound = scene.sound.add('attack_goblin', { volume: 0.5 });

  createAnimations(scene);
  g.play('goblin_run_down');

  g.detectRadiusSq = 250 * 250;
  g.attackRadiusSq = 40 * 40;
  g.speed = 100;
  g.attackCooldown = 800;
  g.lastAttackTime = 0;
  g.state = 'idle';
  g.maxHp = 15;
  g.hp = 15;

  g.takeDamage = function (dmg = 1) {
    if (this.hp <= 0 || this.state === 'hurt') return;

    this.hp -= dmg;
    this.setTintFill(0xff0000);
    this.state = 'hurt';
    this.setVelocity(0);
    this.play('goblin_hurt', true);

    scene.time.delayedCall(100, () => this.clearTint());

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'goblin_hurt', () => {
      if (this.hp <= 0) {
        this.destroy();
        console.log('Goblin morreu!');
      } else {
        this.state = 'chase';
        const dx = scene.player.x - this.x;
        const dy = scene.player.y - this.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
        this.play(`goblin_run_${dir}`, true);
      }
    });
  };

  return g;
}

function createAnimations(scene) {
  const directions = [
    { dir: 'up', start: 0 },
    { dir: 'left', start: 8 },
    { dir: 'down', start: 16 },
    { dir: 'right', start: 24 },
  ];

  directions.forEach(({ dir, start }) => {
    scene.anims.create({
      key: `goblin_run_${dir}`,
      frames: scene.anims.generateFrameNumbers('goblin_run', { start: start, end: start + 7 }),
      frameRate: 12,
      repeat: -1,
    });
  });

  ['up', 'left', 'down', 'right'].forEach((dir, i) => {
    scene.anims.create({
      key: `goblin_attack_${dir}`,
      frames: scene.anims.generateFrameNumbers('goblin_attack', { start: i * 6, end: i * 6 + 5 }),
      frameRate: 10,
      repeat: 0,
    });
  });

  scene.anims.create({
    key: 'goblin_idle',
    frames: scene.anims.generateFrameNumbers('goblin_idle', { start: 0, end: 7 }),
    frameRate: 4,
    repeat: -1,
    yoyo: true,
  });

  scene.anims.create({
    key: 'goblin_hurt',
    frames: scene.anims.generateFrameNumbers('goblin_hurt', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
}

export function updateGoblin(scene, g, player) {
  if (!g.active || !player || g.state === 'hurt' || g.state === 'attack') return;

  const dx = player.x - g.x;
  const dy = player.y - g.y;
  const distSq = dx * dx + dy * dy;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';

  if (distSq > g.detectRadiusSq) {
    if (g.state !== 'idle') {
      g.state = 'idle';
      g.setVelocity(0);
      g.play('goblin_idle', true);
    }
    return;
  }

  if (distSq > g.attackRadiusSq) {
    if (g.state !== 'chase') {
      g.state = 'chase';
    }
    g.play(`goblin_run_${dir}`, true);
    scene.physics.moveToObject(g, player, g.speed);
    return;
  }

  if (scene.time.now - g.lastAttackTime < g.attackCooldown) {
    g.setVelocity(0);
    return;
  }

  g.state = 'attack';
  g.setVelocity(0);
  g.attackSound.play();
  g.play(`goblin_attack_${dir}`, true);

  g.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `goblin_attack_${dir}`, () => {
    if (Phaser.Math.Distance.Between(g.x, g.y, player.x, player.y) <= 40) {
      player.takeDamage?.();
    }
    g.lastAttackTime = scene.time.now;
    g.state = 'chase';
  });
}
