import Phaser from 'phaser';

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
  scene.load.audio('attack_skeleton', 'assets/sounds/ingame/attack-skeleton.mp3');
}

function safePlay(sprite, key) {
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}

export function createEsqueleto(scene, x = 200, y = 200) {
  const e = scene.physics.add.sprite(x, y, 'esqueleto_idle').setSize(32, 40).setOffset(16, 24);

  e.attackSound = scene.sound.add('attack_skeleton', { volume: 0.5 });

  e.aggroRadiusSq = 500 * 500;
  e.disengageRadiusSq = 580 * 580;
  e.attackRadiusSq = 40 * 40;
  e.speed = 90;
  e.attackCooldown = 800;
  e.lastAttackTime = 0;
  e.state = 'idle';
  e.lastDir = 'down';

  e.maxHp = 30;
  e.hp = 30;

  if (!scene.anims.exists('esqueleto_walk_down')) createEsqueletoAnimations(scene);

  safePlay(e, 'esqueleto_idle');

  e.takeDamage = function (dmg = 1) {
    if (this.hp <= 0 || this.state === 'hurt') return;

    this.hp -= dmg;
    scene.showDamage?.(this.x, this.y - 20, dmg);

    this.setTintFill(0xff0000);
    this.state = 'hurt';
    this.setVelocity(0);
    safePlay(this, 'esqueleto_hurt');
    scene.time.delayedCall(100, () => this.clearTint());

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.hp <= 0) {
        scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 1000,
          ease: 'Power1',
          onComplete: () => this.destroy(),
        });
      } else {
        this.state = 'chase';
        safePlay(this, `esqueleto_walk_${this.lastDir}`);
      }
    });
  };

  return e;
}

function createEsqueletoAnimations(scene) {
  const dirs = ['up', 'left', 'down', 'right'];
  dirs.forEach((dir, i) => {
    scene.anims.create({
      key: `esqueleto_walk_${dir}`,
      frames: scene.anims.generateFrameNumbers('esqueleto_walk', { start: i * 8, end: i * 8 + 7 }),
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: `esqueleto_attack_${dir}`,
      frames: scene.anims.generateFrameNumbers('esqueleto_attack', { start: i * 6, end: i * 6 + 5 }),
      frameRate: 10,
      repeat: 0,
    });
  });

  scene.anims.create({
    key: 'esqueleto_idle',
    frames: scene.anims.generateFrameNumbers('esqueleto_idle', { start: 0, end: 7 }),
    frameRate: 4,
    repeat: -1,
    yoyo: true,
  });

  scene.anims.create({
    key: 'esqueleto_hurt',
    frames: scene.anims.generateFrameNumbers('esqueleto_hurt', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
}

export function updateEsqueleto(scene, e, player) {
  if (!e.active || !player || e.state === 'hurt') return;

  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const distSq = dx * dx + dy * dy;

  const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
  e.lastDir = dir;

  switch (e.state) {
    case 'idle':
      if (distSq <= e.aggroRadiusSq) {
        e.state = 'chase';
        safePlay(e, `esqueleto_walk_${dir}`);
      }
      break;

    case 'chase':
      if (distSq >= e.disengageRadiusSq) {
        e.state = 'idle';
        e.setVelocity(0);
        safePlay(e, 'esqueleto_idle');
        return;
      }

      if (distSq <= e.attackRadiusSq) {
        if (scene.time.now - e.lastAttackTime >= e.attackCooldown) {
          e.state = 'attack';
          e.setVelocity(0);
          e.attackSound.play();
          safePlay(e, `esqueleto_attack_${dir}`);
          e.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y) <= 40) {
              player.takeDamage?.(10);
            }
            e.lastAttackTime = scene.time.now;
            e.state = 'chase';
          });
        } else {
          e.setVelocity(0);
          safePlay(e, `esqueleto_walk_${dir}`);
        }
      } else {
        scene.physics.moveToObject(e, player, e.speed);
        safePlay(e, `esqueleto_walk_${dir}`);
      }
      break;

    case 'attack':
      break;
  }
}
