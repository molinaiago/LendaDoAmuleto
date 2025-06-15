import Phaser from 'phaser';
import { configControls, createControls } from './Controls.js';
import { configControls2, createControls2 } from './Controls2.js';
import { createPlayer, loadSprites } from './Player.js';
import { loadSprites2, createPlayer2 } from './Player2.js';
import { loadGoblinSprites, createGoblin, updateGoblin } from './Goblin.js';
import { loadEsqueletoSprites, createEsqueleto, updateEsqueleto } from './Esqueleto.js';
import { loadMagoSprites, createMago, updateMago } from './Mago.js';
import { loadPowerUpSprites, createPowerUpSystem } from './Powerups.js';
import { loadNpcFixoSprites, createNpcFixo } from './Npc1.js';
import { loadNpc2, createNpc2 } from './Npc2.js';

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
    this.isMultiplayer = false;
    this.isGameOver = false;
    this.difficulty = 'Normal';
    this.difficultySettings = {
      Fácil: {
        goblinSpawnCount: 25,
        esqueletoSpawnCount: 25,
        enemyHealthMultiplier: 0.7,
        enemyDamageMultiplier: 0.7,
        powerUpSpawnRateMultiplier: 1.3,
        magoHealth: 350,
        magoBoltDamage: 15,
        playerAttackDamageMultiplier: 1.1,
      },
      Normal: {
        goblinSpawnCount: 50,
        esqueletoSpawnCount: 50,
        enemyHealthMultiplier: 1,
        enemyDamageMultiplier: 1,
        powerUpSpawnRateMultiplier: 1,
        magoHealth: 500,
        magoBoltDamage: 20,
        playerAttackDamageMultiplier: 1,
      },
      Difícil: {
        goblinSpawnCount: 75,
        esqueletoSpawnCount: 75,
        enemyHealthMultiplier: 1.5,
        enemyDamageMultiplier: 1.5,
        powerUpSpawnRateMultiplier: 0.7,
        magoHealth: 700,
        magoBoltDamage: 25,
        playerAttackDamageMultiplier: 0.9,
      },
    };
    this.currentDifficultyConfig = null;
  }

  init(data) {
    this.isMultiplayer = data.isMultiplayer ?? false;
    this.difficulty = data.difficulty ?? 'Normal';
    this.currentDifficultyConfig = this.difficultySettings[this.difficulty];
    this.isGameOver = false;

    console.log(`Mapa iniciado. Multiplayer: ${this.isMultiplayer}, Dificuldade: ${this.difficulty}`);
    console.log('Configuração da dificuldade:', this.currentDifficultyConfig);
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
    if (this.isMultiplayer) loadSprites2(this);
    loadGoblinSprites(this);
    loadEsqueletoSprites(this);
    loadMagoSprites(this);
    loadPowerUpSprites(this);
    loadNpc2(this);
    loadNpcFixoSprites(this);

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

    this.player = createPlayer(this)
      .setPosition(64, map.heightInPixels - 64)
      .setCollideWorldBounds(true);
    this.player.baseAttackDamage = 10 * this.currentDifficultyConfig.playerAttackDamageMultiplier;

    if (this.isMultiplayer) {
      this.player2 = createPlayer2(this)
        .setPosition(128, map.heightInPixels - 64)
        .setCollideWorldBounds(true);
      this.player2.baseAttackDamage = 10 * this.currentDifficultyConfig.playerAttackDamageMultiplier;
    }

    this.npcFixo = createNpcFixo(this, this.player.x + 500, this.player.y - 150);
    this.physics.add.collider(this.player, this.npcFixo);
    if (this.isMultiplayer && this.player2) {
      this.physics.add.collider(this.player2, this.npcFixo);
    }

    this.npc2 = createNpc2(this, this.player.x + 700, this.player.y - 100);
    this.physics.add.collider(this.player, this.npc2);
    if (this.isMultiplayer && this.player2) {
      this.physics.add.collider(this.player2, this.npc2);
    }

    this.npc2DialogLines = [
      'JULIO: Por favor, socorro! Algo terrível aconteceu!',
      'HERÓI: Calma, o que houve?',
      'JULIO: Roubaram o amuleto sagrado da vila... sem ele, tudo irá ruir!',
      'HERÓI: Quem fez isso? Para onde foram?',
      'JULIO: Ninguém viu... mas há pegadas levando para a floresta sombria.',
      'HERÓI: Vou trazê-lo de volta. Prometo.',
    ];
    this.dialogIndexNpc2 = 0;
    this.isDialogueNpc2 = false;

    this.dialogBox = this.add
      .rectangle(this.scale.width / 2, this.scale.height - 60, this.scale.width - 40, 100, 0x000000, 0.8)
      .setScrollFactor(0)
      .setVisible(false);

    this.dialogText = this.add
      .text(30, this.scale.height - 100, '', {
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: this.scale.width - 60 },
      })
      .setScrollFactor(0)
      .setVisible(false);

    this.npcDialogLines = [
      'NEYMAR: Bom dia, caminhante. Você chegou atrasado.',
      'PLAYER: Desculpe, tinha assuntos no vilarejo.',
      'NEYMAR: Fique atento. A estrada adiante não é segura.',
      'PLAYER: Entendido. Obrigado pelo aviso!',
    ];
    this.dialogIndexNpc1 = 0;
    this.isDialogueActive = false;

    this.cameraTarget =
      this.isMultiplayer && this.player2
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
    if (this.isMultiplayer && this.player2) {
      this.physics.add.collider(this.player2, this.groundLayer);
      this.physics.add.collider(this.player2, objetosLayer);
    }

    this.goblinGroup = this.physics.add.group();
    this.esqueletoGroup = this.physics.add.group();

    for (let i = 0; i < this.currentDifficultyConfig.goblinSpawnCount; i++) this.spawnGoblin();
    for (let i = 0; i < this.currentDifficultyConfig.esqueletoSpawnCount; i++) this.spawnEsqueleto();

    this.physics.add.overlap(this.player.attackBox, this.goblinGroup, (_, g) =>
      g.takeDamage?.(this.player.baseAttackDamage),
    );
    this.physics.add.overlap(this.player.attackBox, this.esqueletoGroup, (_, e) =>
      e.takeDamage?.(this.player.baseAttackDamage),
    );

    if (this.isMultiplayer && this.player2) {
      this.physics.add.overlap(this.player2.attackBox, this.goblinGroup, (_, g) =>
        g.takeDamage?.(this.player2.baseAttackDamage),
      );
      this.physics.add.overlap(this.player2.attackBox, this.esqueletoGroup, (_, e) =>
        e.takeDamage?.(this.player2.baseAttackDamage),
      );
    }

    this.wizardBolts = this.physics.add.group();

    const bulletHit = (player, bolt) => {
      const dmg = bolt.getData('dmg') ?? this.currentDifficultyConfig.magoBoltDamage;
      player.takeDamage?.(dmg);
      bolt.destroy();
    };

    this.physics.add.overlap(this.wizardBolts, this.player, bulletHit);
    if (this.player2) this.physics.add.overlap(this.wizardBolts, this.player2, bulletHit);

    this.spawnMago();

    this.physics.add.overlap(this.player.attackBox, this.mago, () =>
      this.mago.takeDamage?.(this.player.baseAttackDamage),
    );
    if (this.isMultiplayer && this.player2) {
      this.physics.add.overlap(this.player2.attackBox, this.mago, () =>
        this.mago.takeDamage?.(this.player2.baseAttackDamage),
      );
    }

    this.powerUps = createPowerUpSystem(this, [objetosLayer], this.currentDifficultyConfig.powerUpSpawnRateMultiplier);
    this.currentPowerUp = null;
    this.currentPowerUp2 = null;

    this.physics.add.overlap(this.player, this.powerUps, (_, pu) => {
      this.currentPowerUp = pu;
    });
    if (this.isMultiplayer && this.player2) {
      this.physics.add.overlap(this.player2, this.powerUps, (_, pu) => {
        this.currentPowerUp2 = pu;
      });
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

    this.keyInteractP1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);
    this.keyInteractP2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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

  startDialogue() {
    this.dialogIndexNpc1 = 0;
    this.isDialogueActive = true;
    this.dialogBox.setVisible(true);
    this.dialogText.setText(this.npcDialogLines[this.dialogIndexNpc1]).setVisible(true);
    this.player.body.setVelocity(0);
    if (this.isMultiplayer && this.player2) this.player2.body.setVelocity(0);
  }

  advanceDialogue() {
    this.dialogIndexNpc1++;
    if (this.dialogIndexNpc1 < this.npcDialogLines.length) {
      this.dialogText.setText(this.npcDialogLines[this.dialogIndexNpc1]);
    } else {
      this.endDialogue();
    }
  }

  endDialogue() {
    this.isDialogueActive = false;
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    this.dialogIndexNpc1 = 0;
  }

  showBossHud() {
    this.bossHudBg.setVisible(true);
    this.bossHud.setVisible(true);
    this.bossName.setVisible(true);
  }

  hideBossHud() {
    this.bossHudBg.setVisible(false);
    this.bossHud.setVisible(false);
    this.bossName.setVisible(false);
  }

  spawnGoblin() {
    const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
    const y = Phaser.Math.Between(0, this.physics.world.bounds.height / 2);
    const g = createGoblin(this, x, y, this.currentDifficultyConfig);
    this.goblinGroup.add(g);
    g.once('destroy', () => this.time.delayedCall(60000, () => this.spawnGoblin()));
  }

  spawnEsqueleto() {
    const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
    const y = Phaser.Math.Between(0, this.physics.world.bounds.height / 2);
    const e = createEsqueleto(this, x, y, this.currentDifficultyConfig);
    this.esqueletoGroup.add(e);
    e.once('destroy', () => this.time.delayedCall(60000, () => this.spawnEsqueleto()));
  }

  spawnMago() {
    this.mago = createMago(this, 14590, 5402, this.currentDifficultyConfig);
    this.physics.add.collider(this.player, this.mago);
    if (this.isMultiplayer && this.player2) {
      this.physics.add.collider(this.player2, this.mago);
    }
  }

  update(time, delta) {
    const dxP1NpcFixo = this.player.x - this.npcFixo.x;
    const dyP1NpcFixo = this.player.y - this.npcFixo.y;
    const distSqP1NpcFixo = dxP1NpcFixo * dxP1NpcFixo + dyP1NpcFixo * dyP1NpcFixo;
    const canP1TalkNpcFixo = distSqP1NpcFixo <= 50 * 50;

    let canP2TalkNpcFixo = false;
    if (this.isMultiplayer && this.player2) {
      const dxP2NpcFixo = this.player2.x - this.npcFixo.x;
      const dyP2NpcFixo = this.player2.y - this.npcFixo.y;
      const distSqP2NpcFixo = dxP2NpcFixo * dxP2NpcFixo + dyP2NpcFixo * dyP2NpcFixo;
      canP2TalkNpcFixo = distSqP2NpcFixo <= 50 * 50;
    }

    const dxP1Npc2 = this.player.x - this.npc2.x;
    const dyP1Npc2 = this.player.y - this.npc2.y;
    const distSqP1Npc2 = dxP1Npc2 * dxP1Npc2 + dyP1Npc2 * dyP1Npc2;
    const canP1TalkNpc2 = distSqP1Npc2 <= 50 * 50;

    let canP2TalkNpc2 = false;
    if (this.isMultiplayer && this.player2) {
      const dxP2Npc2 = this.player2.x - this.npc2.x;
      const dyP2Npc2 = this.player2.y - this.npc2.y;
      const distSqP2Npc2 = dxP2Npc2 * dxP2Npc2 + dyP2Npc2 * dyP2Npc2;
      canP2TalkNpc2 = distSqP2Npc2 <= 50 * 50;
    }

    if (this.isDialogueNpc2) {
      if (
        Phaser.Input.Keyboard.JustDown(this.keyInteractP1) ||
        (this.isMultiplayer && this.player2 && Phaser.Input.Keyboard.JustDown(this.keyInteractP2))
      ) {
        this.dialogIndexNpc2++;
        if (this.dialogIndexNpc2 < this.npc2DialogLines.length) {
          this.dialogText.setText(this.npc2DialogLines[this.dialogIndexNpc2]);
        } else {
          this.dialogBox.setVisible(false);
          this.dialogText.setVisible(false);
          this.isDialogueNpc2 = false;
          this.dialogIndexNpc2 = 0;
        }
      }
      return;
    }

    if (canP1TalkNpc2 && Phaser.Input.Keyboard.JustDown(this.keyInteractP1)) {
      this.dialogIndexNpc2 = 0;
      this.isDialogueNpc2 = true;
      this.dialogBox.setVisible(true);
      this.dialogText.setText(this.npc2DialogLines[this.dialogIndexNpc2]).setVisible(true);
      this.player.body.setVelocity(0);
      if (this.isMultiplayer && this.player2) this.player2.body.setVelocity(0);
      return;
    } else if (
      this.isMultiplayer &&
      this.player2 &&
      canP2TalkNpc2 &&
      Phaser.Input.Keyboard.JustDown(this.keyInteractP2)
    ) {
      this.dialogIndexNpc2 = 0;
      this.isDialogueNpc2 = true;
      this.dialogBox.setVisible(true);
      this.dialogText.setText(this.npc2DialogLines[this.dialogIndexNpc2]).setVisible(true);
      this.player.body.setVelocity(0);
      if (this.isMultiplayer && this.player2) this.player2.body.setVelocity(0);
      return;
    }

    if (this.isDialogueActive) {
      if (
        Phaser.Input.Keyboard.JustDown(this.keyInteractP1) ||
        (this.isMultiplayer && this.player2 && Phaser.Input.Keyboard.JustDown(this.keyInteractP2))
      ) {
        this.advanceDialogue();
      }
      return;
    }

    if (canP1TalkNpcFixo && Phaser.Input.Keyboard.JustDown(this.keyInteractP1)) {
      this.startDialogue();
      return;
    } else if (
      this.isMultiplayer &&
      this.player2 &&
      canP2TalkNpcFixo &&
      Phaser.Input.Keyboard.JustDown(this.keyInteractP2)
    ) {
      this.startDialogue();
      return;
    }

    if (this.isMultiplayer && this.player && this.player2) {
      this.cameraTarget.setPosition((this.player.x + this.player2.x) / 2, (this.player.y + this.player2.y) / 2);
      this.clampToCamera(this.player);
      this.clampToCamera(this.player2);
    } else if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }

    if (this.mago && this.mago.active) {
      const distanceToBoss = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.mago.x, this.mago.y);
      if (distanceToBoss < 600 && !this.bossFightStarted) {
        this.bossFightStarted = true;
        this.showBossHud();
      } else if (distanceToBoss >= 600 && this.bossFightStarted) {
        this.bossFightStarted = false;
        this.hideBossHud();
      }

      if (
        this.bossFightStarted &&
        typeof this.mago.health === 'number' &&
        typeof this.mago.maxHealth === 'number' &&
        this.mago.maxHealth > 0
      ) {
        const bossHpPct = Phaser.Math.Clamp(this.mago.health / this.mago.maxHealth, 0, 1);
        const hudWidth = 400;
        const hudX = this.scale.width / 2 - hudWidth / 2;
        this.bossHudBg.clear().fillStyle(0x000000, 0.7).fillRect(hudX, 70, hudWidth, 20);
        this.bossHud
          .clear()
          .fillStyle(0xff0000, 1)
          .fillRect(hudX, 70, hudWidth * bossHpPct, 20);
      }
    }

    configControls(this.player, this.controls);
    if (this.isMultiplayer && this.player2) configControls2(this.player2, this.controls2);

    const moving1 = this.player.body.velocity.lengthSq() > 0;
    if (moving1 && !this.isStepping1) {
      const tile = this.groundLayer.getTileAtWorldXY(this.player.x, this.player.y + this.player.displayHeight / 2);
      const sound = tile?.properties?.surface === 'stone' ? this.stepStone1 : this.stepGrass1;
      if (sound && !sound.isPlaying) sound.play();
      this.isStepping1 = true;
    } else if (!moving1 && this.isStepping1) {
      this.stepGrass1.stop();
      this.stepStone1.stop();
      this.isStepping1 = false;
    }

    if (this.isMultiplayer && this.player2) {
      const moving2 = this.player2.body.velocity.lengthSq() > 0;
      if (moving2 && !this.isStepping2) {
        const tile2 = this.groundLayer.getTileAtWorldXY(
          this.player2.x,
          this.player2.y + this.player2.displayHeight / 2,
        );
        const sound2 = tile2?.properties?.surface === 'stone' ? this.stepStone2 : this.stepGrass2;
        if (sound2 && !sound2.isPlaying) sound2.play();
        this.isStepping2 = true;
      } else if (!moving2 && this.isStepping2) {
        this.stepGrass2.stop();
        this.stepStone2.stop();
        this.isStepping2 = false;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyInteractP1)) {
      if (this.currentPowerUp) {
        this.soundPickup.play();
        if (this.currentPowerUp.type === 'potion') {
          this.player.heal?.();
          this.soundHeal.play();
          this.showMessage(this.player.x, this.player.y - 50, 'Poção de vida coletada!');
        } else {
          this.player.activateShield?.();
          this.soundShield.play();
          this.showMessage(this.player.x, this.player.y - 50, 'Escudo de proteção ativado!');
        }
        this.currentPowerUp.destroy();
        this.currentPowerUp = null;
      }
    }

    if (this.isMultiplayer && this.player2 && Phaser.Input.Keyboard.JustDown(this.keyInteractP2)) {
      if (this.currentPowerUp2) {
        this.soundPickup.play();
        if (this.currentPowerUp2.type === 'potion') {
          this.player2.heal?.();
          this.soundHeal.play();
          this.showMessage(this.player2.x, this.player2.y - 50, 'Poção de vida coletada!');
        } else {
          this.player2.activateShield?.();
          this.soundShield.play();
          this.showMessage(this.player2.x, this.player2.y - 50, 'Escudo de proteção ativado!');
        }
        this.currentPowerUp2.destroy();
        this.currentPowerUp2 = null;
      }
    }

    if (
      this.player &&
      typeof this.player.health === 'number' &&
      typeof this.player.maxHealth === 'number' &&
      this.player.maxHealth > 0
    ) {
      const pct1 = Phaser.Math.Clamp(this.player.health / this.player.maxHealth, 0, 1);
      this.hpBarBg.clear().fillStyle(0x000000, 0.5).fillRect(20, 20, 200, 16);
      this.hpBar
        .clear()
        .fillStyle(0xff0000, 1)
        .fillRect(20, 20, 200 * pct1, 16);
      this.nameText1.setText('Josué');
    }

    if (
      this.isMultiplayer &&
      this.player2 &&
      typeof this.player2.health === 'number' &&
      typeof this.player2.maxHealth === 'number' &&
      this.player2.maxHealth > 0
    ) {
      const pct2 = Phaser.Math.Clamp(this.player2.health / this.player2.maxHealth, 0, 1);
      this.hpBarBg2.clear().fillStyle(0x000000, 0.5).fillRect(20, 42, 200, 16);
      this.hpBar2
        .clear()
        .fillStyle(0xff66ff, 1)
        .fillRect(20, 42, 200 * pct2, 16);
      this.nameText2.setText('Rita');
    }

    const players = this.isMultiplayer && this.player2 ? [this.player, this.player2] : [this.player];
    this.goblinGroup.getChildren().forEach((g) => updateGoblin(this, g, players, this.currentDifficultyConfig));
    this.esqueletoGroup.getChildren().forEach((e) => updateEsqueleto(this, e, players, this.currentDifficultyConfig));
    if (this.mago && this.mago.active) {
      updateMago(this, this.mago, players, this.currentDifficultyConfig);
    }

    if (!this.isGameOver) {
      for (const p of players) {
        if (p.health <= 0) {
          this.isGameOver = true;
          this.scene.launch('DeathScene', { parentSceneKey: 'Mapa' });
          this.scene.pause();
          break;
        }
      }
    }
  }

  clampToCamera(player, padding = 16) {
    if (!player || !player.body) return;
    const cam = this.cameras.main;
    const { x: worldViewX, right: worldViewRight, y: worldViewY, bottom: worldViewBottom } = cam.worldView;

    player.x = Phaser.Math.Clamp(player.x, worldViewX + padding, worldViewRight - padding);
    player.y = Phaser.Math.Clamp(player.y, worldViewY + padding, worldViewBottom - padding);

    if (player.x === worldViewX + padding || player.x === worldViewRight - padding) {
      player.body.setVelocityX(0);
    }
    if (player.y === worldViewY + padding || player.y === worldViewBottom - padding) {
      player.body.setVelocityY(0);
    }
  }

  showMessage(x, y, message) {
    const msg = this.add
      .text(x, y, message, {
        fontSize: '16px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.tweens.add({
      targets: msg,
      y: y - 50,
      alpha: 0,
      duration: 2500,
      ease: 'Power2',
      onComplete: () => msg.destroy(),
    });
  }
}
