import { Start } from './scenes/Start.js';
import { Mapa } from './scenes/Mapa.js';
import { PauseScene } from './scenes/PauseScene.js';
import { DeathScene } from './scenes/DeathScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      fps: 60,
      debug: false,
    },
  },
  scene: [
    Start,
    Mapa,
    PauseScene,  
    DeathScene, 
    VictoryScene
  ],
  render: {
    pixelArt: true,
    antialiasGL: false,
  },
};

new Phaser.Game(config);
