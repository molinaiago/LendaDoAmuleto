export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.parentSceneKey = data.parentSceneKey;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const panel = this.add.container(width / 2, height / 2);
    const bg = this.add.rectangle(0, 0, 400, 260, 0x222222, 0.9).setOrigin(0.5);

    const victoryText = this.add.text(0, -80, 'VOCÊ VENCEU!', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);

    const restartBtn = this.add
      .text(0, -20, '⟳ Recomeçar', { fontSize: '32px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();
    restartBtn.on('pointerdown', () => {
      this.scene.stop('VictoryScene');
      this.scene.stop(this.parentSceneKey);
      this.scene.start(this.parentSceneKey);
    });

    const menuBtn = this.add.text(0, 40, '← Menu', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
    menuBtn.on('pointerdown', () => {
      window.location.reload();
    });

    panel.add([bg, victoryText, restartBtn, menuBtn]);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop('VictoryScene');
      this.scene.resume(this.parentSceneKey);
    });
  }
}
