import Phaser from 'phaser';

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

function safePlay(sprite, key) {
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}

export function createGoblin(scene, x = 200, y = 200) {
  const g = scene.physics.add.sprite(x, y, 'goblin_idle').setSize(32, 40).setOffset(16, 24);

  g.attackSound = scene.sound.add('attack_goblin', { volume: 0.5 });

  g.aggroRadiusSq = 250 * 250;
  g.disengageRadiusSq = 320 * 320;
  g.attackRadiusSq = 40 * 40;
  g.speed = 100;
  g.attackCooldown = 800;
  g.lastAttackTime = 0;
  g.state = 'idle';
  g.lastDir = 'down';

  g.maxHp = 20;
  g.hp = 20;

  if (!scene.anims.exists('goblin_run_down')) createAnimations(scene);

  safePlay(g, 'goblin_idle');

  g.takeDamage = function (dmg = 1) {
    if (this.hp <= 0 || this.state === 'hurt') return;

    this.hp -= dmg;
    scene.showDamage?.(this.x, this.y - 20, dmg);

    this.setTintFill(0xff0000);
    this.state = 'hurt';
    this.setVelocity(0);
    safePlay(this, 'goblin_hurt');
    scene.time.delayedCall(100, () => this.clearTint());

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.hp <= 0) {
        this.destroy();
      } else {
        this.state = 'chase';
        safePlay(this, `goblin_run_${this.lastDir}`);
      }
    });
  };

  return g;
}

function createAnimations(scene) {
  const rows = [
    { dir: 'up', start: 0 },
    { dir: 'left', start: 8 },
    { dir: 'down', start: 16 },
    { dir: 'right', start: 24 },
  ];

  rows.forEach(({ dir, start }) => {
    scene.anims.create({
      key: `goblin_run_${dir}`,
      frames: scene.anims.generateFrameNumbers('goblin_run', { start, end: start + 7 }),
      frameRate: 12,
      repeat: -1,
    });
  });

  rows.forEach(({ dir }, i) => {
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
  if (!g.active || !player || g.state === 'hurt') return;

  const dx = player.x - g.x;
  const dy = player.y - g.y;
  const distSq = dx * dx + dy * dy;

  const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
  g.lastDir = dir;

  switch (g.state) {
    case 'idle':
      if (distSq <= g.aggroRadiusSq) {
        g.state = 'chase';
        safePlay(g, `goblin_run_${dir}`);
      }
      break;

    case 'chase':
      if (distSq >= g.disengageRadiusSq) {
        g.state = 'idle';
        g.setVelocity(0);
        safePlay(g, 'goblin_idle');
        return;
      }

      if (distSq <= g.attackRadiusSq) {
        if (scene.time.now - g.lastAttackTime >= g.attackCooldown) {
          g.state = 'attack';
          g.setVelocity(0);
          g.attackSound.play();
          safePlay(g, `goblin_attack_${dir}`);
          g.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (Phaser.Math.Distance.Between(g.x, g.y, player.x, player.y) <= 40) {
              player.takeDamage?.(10);
            }
            g.lastAttackTime = scene.time.now;
            g.state = 'chase';
          });
        } else {
          g.setVelocity(0);
          safePlay(g, `goblin_run_${dir}`);
        }
      } else {
        scene.physics.moveToObject(g, player, g.speed);
        safePlay(g, `goblin_run_${dir}`);
      }
      break;

    case 'attack':
      break;
  }
}
