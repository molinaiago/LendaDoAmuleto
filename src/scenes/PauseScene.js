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

    const panel = this.add.container(width/2, height/2);
    const bg = this.add.rectangle(0, 0, 300, 180, 0x222222, 0.9).setOrigin(0.5);

    const resume = this.add
      .text(0, -40, '▶ Continuar', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();

    const restart = this.add
      .text(0, 20, '⟳ Reiniciar', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();

    resume.on('pointerdown', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });

    restart.on('pointerdown', () => {
      this.scene.stop(this.parentSceneKey);
      this.scene.start(this.parentSceneKey);
      this.scene.stop();
    });

    panel.add([bg, resume, restart]);
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });

  }
}
