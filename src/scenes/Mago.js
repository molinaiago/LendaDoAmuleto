export function loadMagoSprites(scene) {
  scene.load.spritesheet('mago_walk', 'assets/map/characters/mago/walk.png', { frameWidth: 64, frameHeight: 64 });
  scene.load.spritesheet('mago_attack', 'assets/map/characters/mago/spellcast.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('mago_hurt', 'assets/map/characters/mago/hurt.png', { frameWidth: 64, frameHeight: 64 });

  scene.load.image('mago_bolt', 'assets/map/characters/mago/mago_bolt.png');
  scene.load.image('mago_fire', 'assets/map/characters/mago/mago_fire.png');
  scene.load.image('mago_nova', 'assets/map/characters/mago/mago_nova.png');

  scene.load.audio('attack_wizard', 'assets/sounds/ingame/attack-wizard.mp3');
}

export function createMago(scene) {
  if (!scene.wizardBolts) scene.wizardBolts = scene.physics.add.group();

  const m = scene.physics.add
    .sprite(0, 0, 'mago_walk', 18)
    .setSize(32, 48)
    .setOffset(16, 16)
    .setImmovable(true)
    .setCollideWorldBounds(true);

  ['up', 'left', 'down', 'right'].forEach((dir, i) => {
    scene.anims.create({
      key: `mago_attack_${dir}`,
      frames: scene.anims.generateFrameNumbers('mago_attack', { start: i * 6, end: i * 6 + 5 }),
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
  m.detectRadiusSq = 600 * 600;
  m.attackCooldown = 1200;
  m.lastAttackTime = 0;
  m.state = 'idle';
  m.maxHp = m.hp = 100;

  m.powers = [
    { key: 'mago_bolt', speed: 260, damage: 20, range: 1000 },
    { key: 'mago_fire', speed: 160, damage: 35, range: 700 },
    { key: 'mago_nova', speed: 0, damage: 25, range: 150 },
  ];
  m.boltGroup = scene.wizardBolts;

  m.takeDamage = function (d = 1) {
    if (this.hp <= 0 || this.state === 'hurt') return;

    this.hp -= d;

    if (this.hp <= 0) {
      scene.events.emit('mago-dead');
      this.destroy();
      return;
    }

    this.state = 'hurt';
    this.setTintFill(0xff0000);
    this.play('mago_hurt', true);
    scene.time.delayedCall(150, () => this.clearTint());
    this.once('animationcomplete-mago_hurt', () => (this.state = 'idle'));
  };

  return m;
}

export function updateMago(scene, m, players) {
  if (!m.active || m.hp <= 0) return;
  if (m.state === 'hurt' || m.state === 'attack') return;

  /* escolhe o player mais perto */
  if (!Array.isArray(players)) players = [players];
  let target = players[0],
    minDist2 = Number.MAX_VALUE;
  players.forEach((p) => {
    const d2 = Phaser.Math.Distance.Squared(p.x, p.y, m.x, m.y);
    if (d2 < minDist2) {
      minDist2 = d2;
      target = p;
    }
  });

  const dx = target.x - m.x,
    dy = target.y - m.y;
  const distSq = dx * dx + dy * dy;

  let dirKey = 'down',
    dirFrame = 18;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      dirKey = 'left';
      dirFrame = 9;
    } else {
      dirKey = 'right';
      dirFrame = 27;
    }
  } else if (dy < 0) {
    dirKey = 'up';
    dirFrame = 0;
  }
  m.setFrame(dirFrame);

  if (distSq > m.detectRadiusSq) return;
  if (scene.time.now - m.lastAttackTime < m.attackCooldown) return;

  m.state = 'attack';
  m.attackSound.play();
  m.play(`mago_attack_${dirKey}`, true);

  m.once(`animationcomplete-mago_attack_${dirKey}`, () => {
    const pwr = Phaser.Utils.Array.GetRandom(m.powers);

    if (pwr.key === 'mago_nova') {
      const nova = m.boltGroup.create(m.x, m.y, 'mago_nova').setCircle(24).setDepth(500);
      scene.tweens.add({ targets: nova, scale: 1.6, alpha: 0, duration: 400, onComplete: () => nova.destroy() });
      players.forEach((p) => {
        if (Phaser.Math.Distance.Between(m.x, m.y, p.x, p.y) <= pwr.range) p.takeDamage?.(pwr.damage);
      });
    } else {
      const proj = m.boltGroup
        .create(m.x, m.y, pwr.key)
        .setCircle(8)
        .setOffset(8, 8)
        .setDepth(500)
        .setData('dmg', pwr.damage);

      proj.setRotation(Phaser.Math.Angle.Between(m.x, m.y, target.x, target.y));
      scene.physics.moveTo(proj, target.x, target.y, pwr.speed);
      scene.time.delayedCall(4000, () => proj.destroy());
    }

    m.lastAttackTime = scene.time.now;
    m.state = 'idle';
  });
}
