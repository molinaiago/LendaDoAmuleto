import { Start } from './scenes/Start.js';
import { Mapa } from './scenes/Mapa.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Start, Mapa],
};

new Phaser.Game(config);
