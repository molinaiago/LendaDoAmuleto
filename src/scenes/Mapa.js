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
    this.load.image('tiled_extras', 'assets/map/constructions/tiled_extras_noBG.png');
    this.load.image('tileset_houses', 'assets/map/constructions/tileset_houses_noBG.png');
    this.load.image('tileset_houses2', 'assets/map/constructions/tileset_houses2_noBG.png');
    this.load.image('tileset_abandoned_houses', 'assets/map/constructions/tileset_abandoned_houses.png');
    this.load.image('tileset_three', 'assets/map/constructions/tileset_three.png');

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
      map.addTilesetImage('tiled_extras', 'tiled_extras'),
      map.addTilesetImage('tileset_houses', 'tileset_houses'),
      map.addTilesetImage('tileset_houses2', 'tileset_houses2'),
      map.addTilesetImage('tileset_abandoned_houses', 'tileset_abandoned_houses'),
      map.addTilesetImage('tileset_three', 'tileset_three'),
    ];

    const layer1 = map.createLayer('Camada de Blocos 1', tilesets, 0, 0);
    const layer2 = map.createLayer('Camada de Blocos 2', tilesets, 0, 0);

    layer1.setCollisionByProperty({ collider: true });
    layer2.setCollisionByProperty({ collider: true });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.player = createPlayer(this);
    this.player.setPosition(64, map.heightInPixels - 64);
    this.player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.controls = createControls(this);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.physics.add.collider(this.player, layer1);
    this.physics.add.collider(this.player, layer2);

    // goblin
    this.goblin = createGoblin(this);
    this.goblin.setPosition(this.player.x + 64, this.player.y);

    // esqueleto
    this.esqueleto = createEsqueleto(this);
    this.esqueleto.setPosition(this.physics.world.bounds.width - 100, 100);

    // mago
    this.mago = createMago(this);
    this.mago.setPosition(this.player.x + 150, this.player.y);

    const walkLayers = [layer1, layer2];
    this.powerUps = createPowerUpSystem(this, walkLayers);

    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => (this.currentPowerUp = pu));

    this.physics.add.overlap(this.player.attackBox, this.goblin, () => {
      this.goblin.takeDamage(0.5);
    });

    this.physics.add.overlap(this.player.attackBox, this.esqueleto, () => {
      this.esqueleto.takeDamage(0.5);
    });

    this.hpText = this.add.text(10, 10, '', { fontSize: 16 }).setScrollFactor(0);
    this.playerHpText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#ffffff' }).setScrollFactor(0);
    this.esqueletoHpText = this.add.text(10, 50, '', { fontSize: '16px', fill: '#ffcc00' }).setScrollFactor(0);
  }

  update() {
    configControls(this.player, this.controls, this);

    if (this.currentPowerUp && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.currentPowerUp.type === 'potion') {
        this.player.heal?.();
      } else if (this.currentPowerUp.type === 'shield') {
        this.player.activateShield?.();
      }

      this.currentPowerUp.destroy();
      this.currentPowerUp = null;
    }

    updateGoblin(this, this.goblin, this.player);
    updateEsqueleto(this, this.esqueleto, this.player);

    if (this.goblin.active) {
      this.hpText.setText(`Goblin HP: ${this.goblin.hp}/${this.goblin.maxHp}`).setColor('cyan');
    } else {
      this.hpText.setText('');
    }

    if (this.esqueleto.active) {
      this.esqueletoHpText.setText(`Esqueleto HP: ${this.esqueleto.hp}/${this.esqueleto.maxHp}`);
    } else {
      this.esqueletoHpText.setText('');
    }

    this.playerHpText.setText(`Player HP: ${this.player.health}/${this.player.maxHealth}`);
  }
}
