const TYPES = ['potion', 'shield'];
const MAX_POWERUPS = 75;
const SPAWN_MIN = 500;
const SPAWN_MAX = 1500;
const SCALE = 0.3;
const MAX_TRIES = 50;
const MIN_DISTANCE = 32;

export function loadPowerUpSprites(scene) {
  scene.load.image('potion', 'assets/map/itens/potion_noBG.png');
  scene.load.image('shield', 'assets/map/itens/shield_noBG.png');
}

export function createPowerUpSystem(scene, solidLayers) {
  const group = scene.physics.add.group();

  function positionIsFree(x, y) {
    for (const layer of solidLayers) {
      const tile = layer.getTileAtWorldXY(x, y, true);
      if (tile && tile.collides) return false;
    }

    for (const pu of group.getChildren()) {
      if (Phaser.Math.Distance.Between(pu.x, pu.y, x, y) < MIN_DISTANCE) return false;
    }

    return true;
  }

  function spawnOne() {
    if (group.countActive(true) >= MAX_POWERUPS) return;

    const w = scene.physics.world.bounds.width;
    const h = scene.physics.world.bounds.height;

    for (let i = 0; i < MAX_TRIES; i++) {
      const x = Phaser.Math.Between(32, w - 32);
      const y = Phaser.Math.Between(32, h - 32);

      if (!positionIsFree(x, y)) continue;

      const key = Phaser.Math.RND.pick(TYPES);
      const item = group.create(x, y, key).setScale(SCALE).setOrigin(0.5).setImmovable(true).setDepth(50);

      item.type = key;
      item.body.setSize(item.displayWidth, item.displayHeight, true);

      console.log('tentativa', i, 'falhou em', x, y);

      return;
    }
  }

  scene.time.addEvent({
    delay: Phaser.Math.Between(SPAWN_MIN, SPAWN_MAX),
    loop: true,
    callback: spawnOne,
  });

  return group;
}
