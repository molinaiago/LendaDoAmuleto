import Phaser from 'phaser';
import { configControls, createControls } from './Controls.js';
import { configControls2, createControls2 } from './Controls2.js';
import { createPlayer, loadSprites } from './Player.js';
import { loadSprites2, createPlayer2 } from './Player2.js';
import { loadGoblinSprites, createGoblin, updateGoblin } from './Goblin.js';
import { loadEsqueletoSprites, createEsqueleto, updateEsqueleto } from './Esqueleto.js';
import { loadMagoSprites, createMago, updateMago } from './Mago.js';
import { loadPowerUpSprites, createPowerUpSystem } from './Powerups.js';

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
    this.goblinGroup = null;
    this.esqueletoGroup = null;
    this.mago = null;
    this.isStepping = false;
    this.currentStepSound = null;
    this.isStepping2 = false;
    this.currentStepSound2 = null;
    this.currentPowerUp = null;
    this.currentPowerUp2 = null;
    this.keyE = null;
    this.isPaused = false;
    this.isDead = false;
    this.damageGroup = null;
    this.cameraTarget = null;
  }

  preload() {
    this.load.tilemapTiledJSON('mapa', 'assets/mapa_vila_floresta.json');
    this.load.image('tileset_cave', 'assets/map/constructions/tileset_cave.png');
    this.load.image('tileset_grass', 'assets/map/blocos/tileset_grass.png');
    this.load.image('tileset_water', 'assets/map/blocos/tileset_water.png');
    this.load.image('tiled_route', 'assets/map/constructions/tiled_route.png');
    this.load.image('tileset_houses_noBG', 'assets/map/constructions/tileset_houses_noBG.png');
    this.load.image('tileset_three_noBG', 'assets/map/constructions/tileset_three_noBG.png');
    this.load.image('tileset_cave_obstacles', 'assets/map/constructions/tileset_cave_obstacles.png');

    loadSprites(this);
    loadSprites2(this);
    loadGoblinSprites(this);
    loadEsqueletoSprites(this);
    loadMagoSprites(this);
    loadPowerUpSprites(this);

    this.load.audio('step_grass', 'assets/sounds/ingame/footsteps-grass.mp3');
    this.load.audio('step_stone', 'assets/sounds/ingame/footsteps-stone.mp3');
  }

  create() {
    this.isPaused = false;
    this.isDead = false;

    const map = this.make.tilemap({ key: 'mapa' });
    const tilesets = [
      map.addTilesetImage('tileset_cave', 'tileset_cave'),
      map.addTilesetImage('tileset_grass', 'tileset_grass'),
      map.addTilesetImage('tileset_water', 'tileset_water'),
      map.addTilesetImage('tiled_route', 'tiled_route'),
      map.addTilesetImage('tileset_houses_noBG', 'tileset_houses_noBG'),
      map.addTilesetImage('tileset_three_noBG', 'tileset_three_noBG'),
      map.addTilesetImage('tileset_cave_obstacles', 'tileset_cave_obstacles'),
    ];

    this.groundLayer = map.createLayer('solo', tilesets, 0, 0);
    const objetosLayer = map.createLayer('objetos', tilesets, 0, 0);

    this.groundLayer.setCollisionByExclusion([-1]);
    objetosLayer.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.player = createPlayer(this)
      .setPosition(64, map.heightInPixels - 64)
      .setCollideWorldBounds(true);

    this.player2 = createPlayer2(this)
      .setPosition(128, map.heightInPixels - 64)
      .setCollideWorldBounds(true);

    this.cameraTarget = this.add.zone((this.player.x + this.player2.x) / 2, (this.player.y + this.player2.y) / 2, 1, 1);
    this.cameras.main
      .startFollow(this.cameraTarget, true, 0.08, 0.08)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.controls = createControls(this);
    this.controls2 = createControls2(this);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, objetosLayer);
    this.physics.add.collider(this.player2, this.groundLayer);
    this.physics.add.collider(this.player2, objetosLayer);

    this.goblinGroup = this.physics.add.group();
    this.esqueletoGroup = this.physics.add.group();
    for (let i = 0; i < 100; i++) this.spawnGoblin();
    for (let i = 0; i < 100; i++) this.spawnEsqueleto();
    this.spawnMago();

    this.powerUps = createPowerUpSystem(this, [objetosLayer]);
    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => {
      this.currentPowerUp = pu;
    });

    this.physics.add.overlap(this.player2, this.powerUps, (_, pu) => {
      this.currentPowerUp2 = pu;
    });

    this.physics.add.overlap(this.player.attackBox, this.goblinGroup, (_, g) => g.takeDamage?.(10));
    this.physics.add.overlap(this.player.attackBox, this.esqueletoGroup, (_, e) => e.takeDamage?.(10));
    this.physics.add.overlap(this.player.attackBox, this.mago, () => this.mago.takeDamage?.(10));
    this.physics.add.overlap(this.player2.attackBox, this.goblinGroup, (_, g) => g.takeDamage?.(10));
    this.physics.add.overlap(this.player2.attackBox, this.esqueletoGroup, (_, e) => e.takeDamage?.(10));
    this.physics.add.overlap(this.player2.attackBox, this.mago, () => this.mago.takeDamage?.(10));

    this.stepGrass1 = this.sound.add('step_grass', { loop: true, volume: 1.0 });
    this.stepStone1 = this.sound.add('step_stone', { loop: true, volume: 1.0 });
    this.stepGrass2 = this.sound.add('step_grass', { loop: true, volume: 1.0 });
    this.stepStone2 = this.sound.add('step_stone', { loop: true, volume: 1.0 });

    this.hpBarBg = this.add.graphics().setScrollFactor(0);
    this.hpBar = this.add.graphics().setScrollFactor(0);

    this.hpBarBg2 = this.add.graphics().setScrollFactor(0);
    this.hpBar2 = this.add.graphics().setScrollFactor(0);

    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.isPaused && !this.isDead) {
        this.scene.launch('PauseScene', { parentSceneKey: 'Mapa' });
        this.scene.pause();
        this.isPaused = true;
      }
    });
    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.isPaused = false;
    });

    this.damageGroup = this.add.group();
    this.showDamage = (x, y, amount) => {
      const txt = this.add
        .text(x, y, amount.toString(), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffec00',
          stroke: '#000',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(1000);
      this.damageGroup.add(txt);
      this.tweens.add({
        targets: txt,
        y: y - 32,
        alpha: 0,
        duration: 600,
        ease: 'quad.out',
        onComplete: () => txt.destroy(),
      });
    };
  }

  spawnGoblin() {
    const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
    const y = Phaser.Math.Between(0, this.physics.world.bounds.height / 2);
    const g = createGoblin(this).setPosition(x, y);
    this.goblinGroup.add(g);
    g.once('destroy', () => this.time.delayedCall(60000, () => this.spawnGoblin()));
  }

  spawnEsqueleto() {
    const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
    const y = Phaser.Math.Between(0, this.physics.world.bounds.height / 2);
    const e = createEsqueleto(this).setPosition(x, y);
    this.esqueletoGroup.add(e);
    e.once('destroy', () => this.time.delayedCall(60000, () => this.spawnEsqueleto()));
  }

  spawnMago() {
    const x = this.physics.world.bounds.width - 256;
    const y = 128;
    this.mago = createMago(this).setPosition(x, y);
    this.physics.add.collider(this.player, this.mago);
  }

  update() {
    this.cameraTarget.setPosition((this.player.x + this.player2.x) / 2, (this.player.y + this.player2.y) / 2);
    this.clampToCamera(this.player);
    this.clampToCamera(this.player2);

    if (this.isDead) return;

    if (this.player.health <= 0) {
      this.isDead = true;
      this.currentStepSound?.stop();
      this.player.body.setVelocity(0);
      this.player.play('player_hurt');
      this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.scene.launch('DeathScene', { parentSceneKey: 'Mapa' });
        this.scene.pause();
      });
      return;
    }

    if (this.player2.health <= 0) {
      this.isDead = true;
      this.currentStepSound?.stop();
      this.player2.body.setVelocity(0);
      this.player2.play('player2_hurt');
      this.player2.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.scene.launch('DeathScene', { parentSceneKey: 'Mapa' });
        this.scene.pause();
      });
      return;
    }

    configControls(this.player, this.controls);
    configControls2(this.player2, this.controls2);

    const moving1 = this.player.body.velocity.lengthSq() > 0;
    if (moving1 && !this.isStepping) {
      const tile = this.groundLayer.getTileAtWorldXY(this.player.x, this.player.y + this.player.height / 2);
      this.currentStepSound = tile?.properties?.surface === 'stone' ? this.stepStone1 : this.stepGrass1;
      this.currentStepSound.play({ seek: 0.05 });
      this.isStepping = true;
    } else if (!moving1 && this.isStepping) {
      this.currentStepSound.stop();
      this.isStepping = false;
    }

    const moving2 = this.player2.body.velocity.lengthSq() > 0;
    if (moving2 && !this.isStepping2) {
      const tile2 = this.groundLayer.getTileAtWorldXY(this.player2.x, this.player2.y + this.player2.height / 2);
      this.currentStepSound2 = tile2?.properties?.surface === 'stone' ? this.stepStone2 : this.stepGrass2;
      this.currentStepSound2.play({ seek: 0.05 });
      this.isStepping2 = true;
    } else if (!moving2 && this.isStepping2) {
      this.currentStepSound2.stop();
      this.isStepping2 = false;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.currentPowerUp) {
        const p = this.player;
        if (this.currentPowerUp.type === 'potion') p.heal?.();
        else p.activateShield?.();
        this.currentPowerUp.destroy();
        this.currentPowerUp = null;
      } else if (this.currentPowerUp2) {
        const p = this.player2;
        if (this.currentPowerUp2.type === 'potion') p.heal?.();
        else p.activateShield?.();
        this.currentPowerUp2.destroy();
        this.currentPowerUp2 = null;
      }
    }

    const players = [this.player, this.player2];

    this.goblinGroup.getChildren().forEach((g) => updateGoblin(this, g, players));
    this.esqueletoGroup.getChildren().forEach((e) => updateEsqueleto(this, e, players));
    updateMago(this, this.mago, this.player);

    // barra de hp p1
    const pct1 = Phaser.Math.Clamp(this.player.health / this.player.maxHealth, 0, 1);
    this.hpBarBg.clear().fillStyle(0x000000, 0.5).fillRect(20, 20, 200, 16);
    this.hpBar
      .clear()
      .fillStyle(0xff0000, 1)
      .fillRect(20, 20, 200 * pct1, 16);

    // barra de hp p2
    const pct2 = Phaser.Math.Clamp(this.player2.health / this.player2.maxHealth, 0, 1);

    this.hpBarBg2.clear().fillStyle(0x000000, 0.5).fillRect(20, 42, 200, 16);

    this.hpBar2
      .clear()
      .fillStyle(0xff66ff, 1)
      .fillRect(20, 42, 200 * pct2, 16);
  }

  clampToCamera(player, padding = 16) {
    const cam = this.cameras.main;
    const left = cam.worldView.x + padding;
    const right = cam.worldView.right - padding;
    const top = cam.worldView.y + padding;
    const bottom = cam.worldView.bottom - padding;

    if (player.x < left) {
      player.x = left;
      player.body.setVelocityX(0);
    }
    if (player.x > right) {
      player.x = right;
      player.body.setVelocityX(0);
    }
    if (player.y < top) {
      player.y = top;
      player.body.setVelocityY(0);
    }
    if (player.y > bottom) {
      player.y = bottom;
      player.body.setVelocityY(0);
    }
  }
}
