export function loadMagoSprites(scene) {
  scene.load.spritesheet('mago_walk', 'assets/map/characters/mago/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('mago_attack', 'assets/map/characters/mago/spellcast.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('mago_hurt', 'assets/map/characters/mago/hurt.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.audio('attack_wizard', 'assets/sounds/ingame/attack-wizard.mp3');
}

export function createMago(scene) {
  const m = scene.physics.add
    .sprite(0, 0, 'mago_walk')
    .setSize(32, 48)
    .setOffset(16, 16)
    .setImmovable(true)
    .setCollideWorldBounds(true);

  ['up', 'left', 'down', 'right'].forEach((dir, i) => {
    scene.anims.create({
      key: `mago_walk_${dir}`,
      frames: scene.anims.generateFrameNumbers('mago_walk', {
        start: i * 8,
        end: i * 8 + 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
  });

  ['up', 'left', 'down', 'right'].forEach((dir, i) => {
    scene.anims.create({
      key: `mago_attack_${dir}`,
      frames: scene.anims.generateFrameNumbers('mago_attack', {
        start: i * 6,
        end: i * 6 + 5,
      }),
      frameRate: 10,
      repeat: 0,
    });
  });

  scene.anims.create({
    key: 'mago_hurt',
    frames: scene.anims.generateFrameNumbers('mago_hurt', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });

  m.attackSound = scene.sound.add('attack_wizard', { volume: 0.3 });
  m.detectRadiusSq = 500 * 500;
  m.attackRadiusSq = 64 * 64;
  m.speed = 70;
  m.attackCooldown = 1000;
  m.lastAttackTime = 0;
  m.state = 'idle';
  m.maxHp = 100;
  m.hp = 100;

  m.takeDamage = function (dmg = 1) {
    if (this.hp <= 0 || this.state === 'hurt') return;
    this.hp -= dmg;
    this.state = 'hurt';
    this.play('mago_hurt', true);
    this.setTintFill(0xff0000);
    scene.time.delayedCall(200, () => this.clearTint());
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE + 'mago_hurt', () => {
      if (this.hp <= 0) {
        this.body.enable = false;
      } else {
        this.state = 'chase';
        this.play('mago_walk_down', true);
      }
    });
  };

  return m;
}

export function updateMago(scene, m, player) {
  if (!m.active || m.hp <= 0 || m.state === 'hurt' || m.state === 'attack') return;
  const dx = player.x - m.x;
  const dy = player.y - m.y;
  const distSq = dx * dx + dy * dy;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';

  if (distSq > m.detectRadiusSq) {
    if (m.state !== 'idle') {
      m.state = 'idle';
      m.play('mago_walk_down', true);
      m.setVelocity(0);
    }
    return;
  }

  if (distSq > m.attackRadiusSq) {
    if (m.state !== 'chase') m.state = 'chase';
    m.play(`mago_walk_${dir}`, true);
    scene.physics.moveToObject(m, player, m.speed);
    return;
  }

  if (scene.time.now - m.lastAttackTime >= m.attackCooldown) {
    m.state = 'attack';
    m.setVelocity(0);
    m.attackSound.play();
    m.play(`mago_attack_${dir}`, true);
    m.once(Phaser.Animations.Events.ANIMATION_COMPLETE + `mago_attack_${dir}`, () => {
      if (Phaser.Math.Distance.Between(m.x, m.y, player.x, player.y) <= 64) {
        player.takeDamage(20);
      }
      m.lastAttackTime = scene.time.now;
      m.state = 'chase';
    });
  } else {
    m.setVelocity(0);
  }
}
