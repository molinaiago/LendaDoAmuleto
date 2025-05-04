export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  preload() {
    this.load.image('menu_bg', 'assets/menu/menu_bg.png');
    this.load.image('logo3', 'assets/menu/logo3.png');
    this.load.image('start', 'assets/menu/start.png');
    this.load.image('options', 'assets/menu/options.png');
    this.load.image('diamond', 'assets/menu/diamond.png');
  }

  create() {
    const { width, height } = this.scale;

    this.background = this.add.image(0, 0, 'menu_bg').setOrigin(0).setDisplaySize(width, height); // Aqui usamos a largura e altura da tela real

    this.add.image(width / 2, 80, 'logo3').setScale(0.8);
    this.add.image(210, 400, 'diamond').setScale(0.5);

    const botaoStart = this.add.image(200, 500, 'start').setScale(0.5).setInteractive();
    botaoStart.on('pointerdown', () => this.scene.start('Mapa'));
    botaoStart.on('pointerover', () => {
      botaoStart.setTint(0xdddddd);
      document.body.style.cursor = 'pointer';
    });
    botaoStart.on('pointerout', () => {
      botaoStart.clearTint();
      document.body.style.cursor = 'default';
    });

    const botaoOptions = this.add.image(200, 600, 'options').setScale(0.5).setInteractive();
    botaoOptions.on('pointerdown', () => console.log('Botão de opções clicado'));
    botaoOptions.on('pointerover', () => {
      botaoOptions.setTint(0xdddddd);
      document.body.style.cursor = 'pointer';
    });
    botaoOptions.on('pointerout', () => {
      botaoOptions.clearTint();
      document.body.style.cursor = 'default';
    });

    this.scale.on('resize', (gameSize) => {
      this.background.setDisplaySize(gameSize.width, gameSize.height);
    });
  }
}
