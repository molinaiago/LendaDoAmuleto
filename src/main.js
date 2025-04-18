import { Start } from './scenes/Start.js';
import { Mapa } from './scenes/Mapa.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { arcade: {
            gravity: { y: 0 },
          }, }
    },
    scene: [Start, Mapa]
};

new Phaser.Game(config);
