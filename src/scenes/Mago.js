export function createMago(scene) {
  const mago = scene.physics.add.sprite(200, 200, 'mago_walk');
  createMagoAnimations(scene);
  mago.anims.play('mago_walk', true);
  return mago;
}

export function loadMagoSprites(scene) {
  scene.load.spritesheet('mago_walk', 'assets/map/characters/mago/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
}

export function createMagoAnimations(scene) {
  scene.anims.create({
    key: 'mago_walk',
    frames: scene.anims.generateFrameNames('mago_walk', {
      start: 0,
      end: 10,
    }),
    frameRate: 4,
    repeat: -1,
  });
}
