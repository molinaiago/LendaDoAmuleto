export function loadEsqueletoSprites(scene) {
  scene.load.spritesheet('esqueleto_walk', 'assets/map/characters/esqueleto/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('esqueleto_attack', 'assets/map/characters/esqueleto/slash.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('esqueleto_hurt', 'assets/map/characters/esqueleto/hurt.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('esqueleto_idle', 'assets/map/characters/esqueleto/spellcast.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
}

export function createEsqueleto(scene) {
  const e = scene.physics.add.sprite(200, 200, 'esqueleto_walk').setSize(32, 40).setOffset(16, 24);

  createEsqueletoAnimations(scene);
  e.play('esqueleto_walk_down');

  e.detectRadiusSq = 500 * 500;
  e.attackRadiusSq = 40 * 40;
  e.speed = 90;
  e.attackCooldown = 800;
  e.lastAttackTime = 0;
  e.state = 'idle';
  e.maxHp = 20;
  e.hp = 20;

  e.takeDamage = function (dmg = 1) {
    if (this.hp <= 0 || this.state === 'hurt') return;

    this.hp -= dmg;
    this.setTintFill(0xff0000);
    this.state = 'hurt';
    this.setVelocity(0);
    this.play('esqueleto_hurt', true);

    scene.time.delayedCall(100, () => this.clearTint());

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'esqueleto_hurt', () => {
      if (this.hp <= 0) {
        this.destroy();
        console.log('Esqueleto morreu!');
      } else {
        this.state = 'chase';
        const dx = scene.player.x - this.x;
        const dy = scene.player.y - this.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
        this.play(`esqueleto_walk_${dir}`, true);
      }
    });
  };

  return e;
}

function createEsqueletoAnimations(scene) {
  const directions = [
    { dir: 'up', start: 0 },
    { dir: 'left', start: 8 },
    { dir: 'down', start: 16 },
    { dir: 'right', start: 24 },
  ];

  directions.forEach(({ dir, start }) => {
    scene.anims.create({
      key: `esqueleto_walk_${dir}`,
      frames: scene.anims.generateFrameNumbers('esqueleto_walk', {
        start: start,
        end: start + 7,
      }),
      frameRate: 12,
      repeat: -1,
    });
  });

  ['up', 'left', 'down', 'right'].forEach((dir, i) => {
    scene.anims.create({
      key: `esqueleto_attack_${dir}`,
      frames: scene.anims.generateFrameNumbers('esqueleto_attack', {
        start: i * 6,
        end: i * 6 + 5,
      }),
      frameRate: 10,
      repeat: 0,
    });
  });

  scene.anims.create({
    key: 'esqueleto_idle',
    frames: scene.anims.generateFrameNumbers('esqueleto_idle', {
      start: 0,
      end: 7,
    }),
    frameRate: 4,
    repeat: -1,
    yoyo: true,
  });

  scene.anims.create({
    key: 'esqueleto_hurt',
    frames: scene.anims.generateFrameNumbers('esqueleto_hurt', {
      start: 0,
      end: 5,
    }),
    frameRate: 10,
    repeat: 0,
  });
}

export function updateEsqueleto(scene, e, player) {
  if (!e.active || !player || e.state === 'hurt' || e.state === 'attack') return;

  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const distSq = dx * dx + dy * dy;

  const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';

  if (distSq > e.detectRadiusSq) {
    if (e.state !== 'idle') {
      e.state = 'idle';
      e.setVelocity(0);
      e.play('esqueleto_idle', true);
    }
    return;
  }

  if (distSq > e.attackRadiusSq) {
    if (e.state !== 'chase') {
      e.state = 'chase';
    }
    e.play(`esqueleto_walk_${dir}`, true);
    scene.physics.moveToObject(e, player, e.speed);
    return;
  }

  if (scene.time.now - e.lastAttackTime < e.attackCooldown) {
    e.setVelocity(0);
    return;
  }

  e.state = 'attack';
  e.setVelocity(0);
  e.play(`esqueleto_attack_${dir}`, true);

  e.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `esqueleto_attack_${dir}`, () => {
    if (Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y) <= 40) {
      player.takeDamage?.();
    }
    e.lastAttackTime = scene.time.now;
    e.state = 'chase';
  });
}
