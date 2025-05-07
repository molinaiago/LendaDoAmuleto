import { configControls, createControls } from './Controls.js';
import { createPlayer, loadSprites } from './Player.js';
import { loadGoblinSprites, createGoblin, updateGoblin } from './Goblin.js';
import { createEsqueleto, loadEsqueletoSprites, updateEsqueleto } from './Esqueleto.js';
import { loadMagoSprites, createMago } from './Mago.js';
import { loadPowerUpSprites, createPowerUpSystem } from './Powerups.js';

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
    this.isStepping = false;
    this.currentStepSound = null;
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
    const layerObjetos = map.createLayer('objetos', tilesets, 0, 0);
    this.groundLayer.setCollisionByExclusion([-1]);
    layerObjetos.setCollisionByExclusion([-1]);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player = createPlayer(this)
      .setPosition(64, map.heightInPixels - 64)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player).setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.controls = createControls(this);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, layerObjetos);
    this.goblin = createGoblin(this).setPosition(this.player.x + 64, this.player.y);
    this.esqueleto = createEsqueleto(this).setPosition(this.physics.world.bounds.width - 100, 100);
    this.mago = createMago(this).setPosition(this.player.x + 150, this.player.y);
    this.physics.add.collider(this.player, this.goblin);
    this.physics.add.collider(this.player, this.esqueleto);
    this.physics.add.collider(this.player, this.mago);
    this.powerUps = createPowerUpSystem(this, [this.groundLayer, layerObjetos]);
    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => (this.currentPowerUp = pu));
    this.physics.add.overlap(this.player.attackBox, this.goblin, () => this.goblin.takeDamage(0.5));
    this.physics.add.overlap(this.player.attackBox, this.esqueleto, () => this.esqueleto.takeDamage(0.5));
    this.stepGrass = this.sound.add('step_grass', { loop: true, volume: 1.0 });
    this.stepStone = this.sound.add('step_stone', { loop: true, volume: 1.0 });
    this.hpText = this.add.text(10, 10, '', { fontSize: 16 }).setScrollFactor(0);
    this.playerHpText = this.add.text(10, 30, '', { fill: '#ffffff' }).setScrollFactor(0);
    this.esqueletoHpText = this.add.text(10, 50, '', { fill: '#ffcc00' }).setScrollFactor(0);
  }

  update() {
    configControls(this.player, this.controls);
    const moving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
    if (moving && !this.isStepping) {
      const x = this.player.x;
      const y = this.player.y + this.player.height / 2;
      const tile = this.groundLayer.getTileAtWorldXY(x, y);
      const surface = tile?.properties?.surface;
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
