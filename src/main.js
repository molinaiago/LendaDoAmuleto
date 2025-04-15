import { Start } from './scenes/start.js';
import { Mapa } from './scenes/mapa.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [Start, Mapa]
};

new Phaser.Game(config);
