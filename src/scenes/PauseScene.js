export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.parentSceneKey = data.parentSceneKey;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0);

    const panel = this.add.container(width / 2, height / 2);
    const bg = this.add.rectangle(0, 0, 300, 260, 0x222222, 0.9).setOrigin(0.5);

    const resumeBtn = this.add
      .text(0, -80, '▶ Continuar', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();
    resumeBtn.on('pointerdown', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });

    const restartBtn = this.add
      .text(0, -20, '⟳ Reiniciar', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();
    restartBtn.on('pointerdown', () => {
      this.scene.stop(this.parentSceneKey);
      this.scene.start(this.parentSceneKey);
      this.scene.stop();
    });

    const menuBtn = this.add
      .text(0, 40, '← Menu', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();
    menuBtn.on('pointerdown', () => {
      window.location.reload();
    });

    panel.add([bg, resumeBtn, restartBtn, menuBtn]);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });
  }
}
