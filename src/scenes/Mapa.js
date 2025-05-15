// src/scenes/Mapa.js

import { configControls, createControls } from './Controls.js';
import { createPlayer, loadSprites } from './Player.js';
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
    this.currentPowerUp = null;
    this.keyE = null;
    this.isPaused = false;
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
    loadGoblinSprites(this);
    loadEsqueletoSprites(this);
    loadMagoSprites(this);
    loadPowerUpSprites(this);

    this.load.audio('step_grass', 'assets/sounds/ingame/footsteps-grass.mp3');
    this.load.audio('step_stone', 'assets/sounds/ingame/footsteps-stone.mp3');
  }

  create() {
    // reseta flag de pausa ao iniciar/criar a cena
    this.isPaused = false;

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

    this.cameras.main.startFollow(this.player)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.controls = createControls(this);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, objetosLayer);

    this.goblinGroup = this.physics.add.group();
    this.esqueletoGroup = this.physics.add.group();

    for (let i = 0; i < 5; i++) this.spawnGoblin();
    for (let i = 0; i < 5; i++) this.spawnEsqueleto();
    this.spawnMago();

    this.powerUps = createPowerUpSystem(this, [objetosLayer]);
    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => {
      this.currentPowerUp = pu;
    });

    this.physics.add.overlap(this.player.attackBox, this.goblinGroup, (_, g) => g.takeDamage?.(10));
    this.physics.add.overlap(this.player.attackBox, this.esqueletoGroup, (_, e) => e.takeDamage?.(10));
    this.physics.add.overlap(this.player.attackBox, this.mago, () => this.mago.takeDamage?.(10));

    this.stepGrass = this.sound.add('step_grass', { loop: true, volume: 1.0 });
    this.stepStone = this.sound.add('step_stone', { loop: true, volume: 1.0 });

    this.hpBarBg = this.add.graphics().setScrollFactor(0);
    this.hpBar   = this.add.graphics().setScrollFactor(0);

    // listener da tecla ESC para pausar
    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.isPaused) {
        this.scene.launch('PauseScene', { parentSceneKey: 'Mapa' });
        this.scene.pause();
        this.isPaused = true;
      }
    });

    // ao voltar do PauseScene, resetamos a flag
    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.isPaused = false;
    });
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
    configControls(this.player, this.controls);

    if (this.player.isHurt) return;

    const moving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;

    if (moving && !this.isStepping) {
      const wx = this.player.x;
      const wy = this.player.y + this.player.height / 2;
      const ft = this.groundLayer.getTileAtWorldXY(wx, wy);
      const surface = ft?.properties?.surface;
      this.currentStepSound = surface === 'stone' ? this.stepStone : this.stepGrass;
      this.currentStepSound.play({ seek: 0.05 });
      this.isStepping = true;
    }
    if (!moving && this.isStepping) {
      this.currentStepSound.stop();
      this.isStepping = false;
    }

    if (this.currentPowerUp && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.currentPowerUp.type === 'potion') this.player.heal?.();
      else this.player.activateShield?.();
      this.currentPowerUp.destroy();
      this.currentPowerUp = null;
    }

    this.goblinGroup.getChildren().forEach(g => updateGoblin(this, g, this.player));
    this.esqueletoGroup.getChildren().forEach(e => updateEsqueleto(this, e, this.player));
    updateMago(this, this.mago, this.player);

    // barra de vida do jogador
    const pct = Phaser.Math.Clamp(this.player.health / this.player.maxHealth, 0, 1);
    const barW = 200, barH = 16;
    this.hpBarBg.clear()
      .fillStyle(0x000000, 0.5)
      .fillRect(20, 20, barW, barH);
    this.hpBar.clear()
      .fillStyle(0xff0000, 1.0)
      .fillRect(20, 20, barW * pct, barH);
  }
}