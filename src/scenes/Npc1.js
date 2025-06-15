import { safePlay } from '../utils/aiHelpers.js';

export function loadNpcFixoSprites(scene) {
  scene.load.spritesheet('npc_fixo_idle', 'assets/map/characters/npc/idle.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
}

export function createNpcFixo(scene, x = 0, y = 0) {
  const n = scene.physics.add.sprite(x, y, 'npc_fixo_idle').setSize(32, 40).setOffset(16, 24);

  n.state = 'idle';
  n.interacted = false;

  if (!scene.anims.exists('npc_fixo_idle_anim')) {
    scene.anims.create({
      key: 'npc_fixo_idle_anim',
      frames: scene.anims.generateFrameNumbers('npc_fixo_idle', { start: 0, end: 7 }),
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    });
  }

  safePlay(n, 'npc_fixo_idle_anim');
  n.body.immovable = true;

  return n;
}
