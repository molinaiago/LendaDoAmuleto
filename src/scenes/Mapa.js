import { configControls, createControls } from './Controls.js';
import { createPlayer, loadSprites } from './Player.js';
import { loadGoblinSprites, createGoblin, updateGoblin } from './Goblin.js';
import { createEsqueleto, loadEsqueletoSprites, updateEsqueleto } from './Esqueleto.js';
import { loadMagoSprites, createMago } from './Mago.js';
import { loadPowerUpSprites, createPowerUpSystem } from './Powerups.js';

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
    this.player = null;
    this.controls = null;
    this.keyE = null;
    this.currentPowerUp = null;
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

    const layerSolo = map.createLayer('solo', tilesets, 0, 0);
    const layerObjetos = map.createLayer('objetos', tilesets, 0, 0);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    layerObjetos.setCollisionByExclusion([-1]);

    // debug visual
    const debugGraphics = this.add.graphics().setAlpha(0.5);
    layerSolo.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(0, 0, 255, 255),
    });
    layerObjetos.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255),
    });

    this.player = createPlayer(this)
      .setPosition(64, map.heightInPixels - 64)
      .setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player).setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.controls = createControls(this);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.physics.add.collider(this.player, layerSolo);
    this.physics.add.collider(this.player, layerObjetos);

    this.goblin = createGoblin(this).setPosition(this.player.x + 64, this.player.y);
    this.esqueleto = createEsqueleto(this).setPosition(this.physics.world.bounds.width - 100, 100);
    this.mago = createMago(this).setPosition(this.player.x + 150, this.player.y);

    this.physics.add.collider(this.player, this.goblin);
    this.physics.add.collider(this.player, this.esqueleto);
    this.physics.add.collider(this.player, this.mago);

    this.powerUps = createPowerUpSystem(this, [layerSolo, layerObjetos]);
    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => (this.currentPowerUp = pu));

    this.physics.add.overlap(this.player.attackBox, this.goblin, () => this.goblin.takeDamage(0.5));
    this.physics.add.overlap(this.player.attackBox, this.esqueleto, () => this.esqueleto.takeDamage(0.5));

    this.hpText = this.add.text(10, 10, '').setScrollFactor(0);
    this.playerHpText = this.add.text(10, 30, '', { fill: '#ffffff' }).setScrollFactor(0);
    this.esqueletoHpText = this.add.text(10, 50, '', { fill: '#ffcc00' }).setScrollFactor(0);
  }

  update() {
    configControls(this.player, this.controls, this);

    if (this.currentPowerUp && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.currentPowerUp.type === 'potion') this.player.heal?.();
      else if (this.currentPowerUp.type === 'shield') this.player.activateShield?.();
      this.currentPowerUp.destroy();
      this.currentPowerUp = null;
    }

    updateGoblin(this, this.goblin, this.player);
    updateEsqueleto(this, this.esqueleto, this.player);

    if (this.goblin.active) this.hpText.setText(`Goblin HP: ${this.goblin.hp}/${this.goblin.maxHp}`).setColor('cyan');
    else this.hpText.setText('');
    if (this.esqueleto.active)
      this.esqueletoHpText.setText(`Esqueleto HP: ${this.esqueleto.hp}/${this.esqueleto.maxHp}`);
    else this.esqueletoHpText.setText('');
    this.playerHpText.setText(`Player HP: ${this.player.health}/${this.player.maxHealth}`);
  }
}
