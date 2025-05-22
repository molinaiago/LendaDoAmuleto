function setButtonHitbox(image, padding = 20) {
  const width = image.displayWidth + padding;
  const height = image.displayHeight + padding;
  image.input.hitArea.setSize(width, height);
}

export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
    this.menuMusic = null;
    this.optionsContainer = null;
    this.soundOn = true;
    this.isMultiplayer = false;
  }

  preload() {
    this.load.image('menu_bg', 'assets/menu/menu_bg.png');
    this.load.image('logo3', 'assets/menu/logo3.png');
    this.load.image('start', 'assets/menu/start.png');
    this.load.image('options', 'assets/menu/options.png');
    this.load.image('multiplayer', 'assets/menu/multiplayer.png');
    this.load.image('diamond', 'assets/menu/diamond.png');

    this.load.audio('menu_theme', 'assets/sounds/menu/sound-menu.mp3');
  }

  create() {
    const { width, height } = this.scale;

    this.menuMusic = this.sound.add('menu_theme', { loop: true, volume: 0.5 });
    if (!this.sound.locked) {
      this.menuMusic.play();
    } else {
      this.sound.once('unlocked', () => this.menuMusic.play());
    }

    this.background = this.add.image(0, 0, 'menu_bg').setOrigin(0).setDisplaySize(width, height);
    this.add.image(width / 2, 80, 'logo3').setScale(0.8);
    this.add.image(210, 350, 'diamond').setScale(0.5);

    // start
    const btnStart = this.add.image(200, 450, 'start').setScale(0.5).setInteractive();

    setButtonHitbox(btnStart);

    btnStart
      .on('pointerover', () => {
        btnStart.setTint(0xdddddd);
        document.body.style.cursor = 'pointer';
      })
      .on('pointerout', () => {
        btnStart.clearTint();
        document.body.style.cursor = 'default';
      })
      .on('pointerdown', () => {
        this.isMultiplayer = false;
        this.menuMusic.stop();
        this.scene.start('Mapa', { isMultiplayer: false });
      });

    // mp
    const btnMultiplayer = this.add.image(200, 550, 'multiplayer').setScale(0.5).setInteractive();

    setButtonHitbox(btnMultiplayer);

    btnMultiplayer
      .on('pointerover', () => {
        btnMultiplayer.setTint(0xdddddd);
        document.body.style.cursor = 'pointer';
      })
      .on('pointerout', () => {
        btnMultiplayer.clearTint();
        document.body.style.cursor = 'default';
      })
      .on('pointerdown', () => {
        this.isMultiplayer = true;
        this.menuMusic.stop();
        this.scene.start('Mapa', { isMultiplayer: true });
      });

    // opcoes
    const btnOptions = this.add.image(200, 650, 'options').setScale(0.5).setInteractive();

    setButtonHitbox(btnOptions);

    btnOptions
      .on('pointerover', () => {
        btnOptions.setTint(0xdddddd);
        document.body.style.cursor = 'pointer';
      })
      .on('pointerout', () => {
        btnOptions.clearTint();
        document.body.style.cursor = 'default';
      })
      .on('pointerdown', () => this.showOptions());

    this.scale.on('resize', ({ width, height }) => {
      this.background.setDisplaySize(width, height);
    });
  }

  showOptions() {
    if (this.optionsContainer) return;

    const { width, height } = this.scale;
    const container = this.add.container(0, 0);

    const bg = this.add.rectangle(width / 2, height / 2, 400, 300, 0x000000, 0.75);
    bg.setStrokeStyle(2, 0xffffff);
    container.add(bg);

    const title = this.add
      .text(width / 2, height / 2 - 120, 'OPÇÕES', { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5);
    container.add(title);

    const soundText = this.add
      .text(width / 2 - 80, height / 2 - 40, 'Som de menu:', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);
    container.add(soundText);

    const soundToggle = this.add
      .text(width / 2 + 80, height / 2 - 40, this.soundOn ? 'ON' : 'OFF', {
        fontSize: '20px',
        color: this.soundOn ? '#00ff00' : '#ff0000',
      })
      .setOrigin(0.5)
      .setInteractive();
    soundToggle.on('pointerdown', () => {
      this.soundOn = !this.soundOn;
      soundToggle.setText(this.soundOn ? 'ON' : 'OFF');
      soundToggle.setColor(this.soundOn ? '#00ff00' : '#ff0000');
      if (this.soundOn) this.menuMusic.play();
      else this.menuMusic.pause();
    });
    container.add(soundToggle);

    const btnClose = this.add
      .text(width / 2, height / 2 + 100, 'Fechar', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#333333',
      })
      .setPadding(10)
      .setOrigin(0.5)
      .setInteractive();
    btnClose
      .on('pointerover', () => {
        btnClose.setStyle({ backgroundColor: '#555555' });
        document.body.style.cursor = 'pointer';
      })
      .on('pointerout', () => {
        btnClose.setStyle({ backgroundColor: '#333333' });
        document.body.style.cursor = 'default';
      })
      .on('pointerdown', () => this.closeOptions());
    container.add(btnClose);

    this.optionsContainer = container;
  }

  closeOptions() {
    this.optionsContainer.destroy(true);
    this.optionsContainer = null;
  }
}
