// Npc2.js
import { safePlay } from '../utils/aiHelpers.js';

export function loadNpc2(scene) {
  scene.load.spritesheet('npc2_idle', 'assets/map/characters/npc2/idle.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
}

export function createNpc2(scene, x = 0, y = 0) {
  const n = scene.physics.add.sprite(x, y, 'npc2_idle').setSize(32, 40).setOffset(16, 24);
  n.state = 'idle';
  n.interacted = false;

  if (!scene.anims.exists('npc2_idle_anim')) {
    scene.anims.create({
      key: 'npc2_idle_anim',
      frames: scene.anims.generateFrameNumbers('npc2_idle', { start: 0, end: 7 }),
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    });
  }

  safePlay(n, 'npc2_idle_anim');
  n.body.immovable = true;

  return n;
}