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
    this.isMultiplayer = false;
    this.isGameOver = false;
  }

  init(data) {
    this.isMultiplayer = data.isMultiplayer ?? false;
    this.isGameOver = false;
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

    this.load.audio('pickup', 'assets/sounds/ingame/pickup.mp3');
    this.load.audio('heal', 'assets/sounds/ingame/heal.mp3');
    this.load.audio('shield', 'assets/sounds/ingame/shield.mp3');
    this.load.audio('step_grass', 'assets/sounds/ingame/footsteps-grass.mp3');
    this.load.audio('step_stone', 'assets/sounds/ingame/footsteps-stone.mp3');
  }

  create() {
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

    this.player = createPlayer(this).setPosition(64, map.heightInPixels - 64).setCollideWorldBounds(true);

    if (this.isMultiplayer) {
      this.player2 = createPlayer2(this).setPosition(128, map.heightInPixels - 64).setCollideWorldBounds(true);
    }

    this.cameraTarget = this.isMultiplayer
      ? this.add.zone((this.player.x + this.player2.x) / 2, (this.player.y + this.player2.y) / 2, 1, 1)
      : this.player;

    this.cameras.main
      .startFollow(this.cameraTarget, true, 0.08, 0.08)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.controls = createControls(this);
    if (this.isMultiplayer) this.controls2 = createControls2(this);

    this.soundPickup = this.sound.add('pickup');
    this.soundHeal = this.sound.add('heal');
    this.soundShield = this.sound.add('shield');

    this.stepGrass1 = this.sound.add('step_grass', { loop: true, volume: 0.8 });
    this.stepStone1 = this.sound.add('step_stone', { loop: true, volume: 0.8 });

    if (this.isMultiplayer) {
      this.stepGrass2 = this.sound.add('step_grass', { loop: true, volume: 0.8 });
      this.stepStone2 = this.sound.add('step_stone', { loop: true, volume: 0.8 });
    }

    this.isStepping1 = false;
    this.isStepping2 = false;

    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, objetosLayer);
    if (this.isMultiplayer) {
      this.physics.add.collider(this.player2, this.groundLayer);
      this.physics.add.collider(this.player2, objetosLayer);
    }

    this.goblinGroup = this.physics.add.group();
    this.esqueletoGroup = this.physics.add.group();
    for (let i = 0; i < 5; i++) this.spawnGoblin();
    for (let i = 0; i < 5; i++) this.spawnEsqueleto();

    this.wizardBolts = this.physics.add.group();

    const bulletHit = (player, bolt) => {
      const dmg = bolt.getData('dmg') ?? 20;
      player.takeDamage?.(dmg);
      bolt.destroy();
    };

    this.physics.add.overlap(this.wizardBolts, this.player, bulletHit);
    if (this.player2) this.physics.add.overlap(this.wizardBolts, this.player2, bulletHit);

    this.spawnMago();

    this.powerUps = createPowerUpSystem(this, [objetosLayer]);
    this.currentPowerUp = null;
    this.currentPowerUp2 = null;

    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => {
      this.currentPowerUp = pu;
    });
    if (this.isMultiplayer) {
      this.physics.add.overlap(this.player2, this.powerUps, (_, pu) => {
        this.currentPowerUp2 = pu;
      });
    }

    this.physics.add.overlap(this.player.attackBox, this.goblinGroup, (_, g) => g.takeDamage?.(10));
    this.physics.add.overlap(this.player.attackBox, this.esqueletoGroup, (_, e) => e.takeDamage?.(10));
    this.physics.add.overlap(this.player.attackBox, this.mago, () => this.mago.takeDamage?.(10));

    if (this.isMultiplayer) {
      this.physics.add.overlap(this.player2.attackBox, this.goblinGroup, (_, g) => g.takeDamage?.(10));
      this.physics.add.overlap(this.player2.attackBox, this.esqueletoGroup, (_, e) => e.takeDamage?.(10));
      this.physics.add.overlap(this.player2.attackBox, this.mago, () => this.mago.takeDamage?.(10));
    }

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene', { parentSceneKey: 'Mapa' });
      this.scene.pause();
    });

    this.events.once('mago-dead', () => {
      this.hideBossHud();
      this.scene.launch('VictoryScene', { parentSceneKey: 'Mapa' });
      this.scene.pause();
    });

    this.hpBarBg = this.add.graphics().setScrollFactor(0);
    this.hpBar = this.add.graphics().setScrollFactor(0);
    if (this.isMultiplayer) {
      this.hpBarBg2 = this.add.graphics().setScrollFactor(0);
      this.hpBar2 = this.add.graphics().setScrollFactor(0);
    }

    this.nameText1 = this.add
      .text(20, 4, 'Josué', { fontSize: '14px', color: '#ff0000', backgroundColor: '#000' })
      .setScrollFactor(0);

    if (this.isMultiplayer) {
      this.nameText2 = this.add
        .text(20, 26, 'Rita', { fontSize: '14px', color: '#ff66ff', backgroundColor: '#000' })
        .setScrollFactor(0);
    }

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.bossHudBg = this.add.graphics().setScrollFactor(0).setVisible(false);
    this.bossHud = this.add.graphics().setScrollFactor(0).setVisible(false);

    this.bossName = this.add
      .text(this.scale.width / 2, 40, 'O MAGO SOMBRIO', {
        fontSize: '24px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
        fontFamily: 'Arial',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    this.bossFightStarted = false;
  }

  showBossHud() {
    this.bossHud.setVisible(true);
    this.bossHudBg.setVisible(true);
    this.bossName.setVisible(true);
  }

  hideBossHud() {
    this.bossHud.setVisible(false);
    this.bossHudBg.setVisible(false);
    this.bossName.setVisible(false);
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
    this.mago = createMago(this).setPosition(14590, 5402);
    this.physics.add.collider(this.player, this.mago);
    if (this.isMultiplayer) this.physics.add.collider(this.player2, this.mago);
  }

  update() {
    if (this.isMultiplayer) {
      this.cameraTarget.setPosition((this.player.x + this.player2.x) / 2, (this.player.y + this.player2.y) / 2);
      this.clampToCamera(this.player);
      this.clampToCamera(this.player2);
    }

    const distanceToBoss = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.mago.x, this.mago.y);
    if (distanceToBoss < 600) {
      this.bossFightStarted = true;
      this.showBossHud();
    } else {
      this.bossFightStarted = false;
      this.hideBossHud();
    }

    if (this.bossFightStarted) {
      const pct = Phaser.Math.Clamp(this.mago.hp / this.mago.maxHp, 0, 1);
      this.bossHudBg.clear().fillStyle(0x000000, 0.6).fillRect(this.scale.width / 2 - 200, 70, 400, 18);
      this.bossHud.clear().fillStyle(0xff0000, 1).fillRect(this.scale.width / 2 - 200, 70, 400 * pct, 18);
    }

    configControls(this.player, this.controls);
    if (this.isMultiplayer) configControls2(this.player2, this.controls2);

    const pct1 = Phaser.Math.Clamp(this.player.health / this.player.maxHealth, 0, 1);
    this.hpBarBg.clear().fillStyle(0x000000, 0.5).fillRect(20, 20, 200, 16);
    this.hpBar.clear().fillStyle(0xff0000, 1).fillRect(20, 20, 200 * pct1, 16);
    this.nameText1.setText('Josué');

    if (this.isMultiplayer) {
      const pct2 = Phaser.Math.Clamp(this.player2.health / this.player2.maxHealth, 0, 1);
      this.hpBarBg2.clear().fillStyle(0x000000, 0.5).fillRect(20, 42, 200, 16);
      this.hpBar2.clear().fillStyle(0xff66ff, 1).fillRect(20, 42, 200 * pct2, 16);
      this.nameText2.setText('Rita');
    }

    const players = this.isMultiplayer ? [this.player, this.player2] : [this.player];
    this.goblinGroup.getChildren().forEach((g) => updateGoblin(this, g, players));
    this.esqueletoGroup.getChildren().forEach((e) => updateEsqueleto(this, e, players));
    updateMago(this, this.mago, players);
  }

  clampToCamera(player, padding = 16) {
    const cam = this.cameras.main;
    const left = cam.worldView.x + padding;
    const right = cam.worldView.right - padding;
    const top = cam.worldView.y + padding;
    const bottom = cam.worldView.bottom - padding;

    if (player.x < left) player.x = left;
    if (player.x > right) player.x = right;
    if (player.y < top) player.y = top;
    if (player.y > bottom) player.y = bottom;
  }
}
