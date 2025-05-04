const TYPES = ['potion', 'shield'];
const MAX_POWERUPS = 200;
const SPAWN_MIN = 500;
const SPAWN_MAX = 1500;
const SCALE = 0.3;
const MAX_TRIES = 100;

export function loadPowerUpSprites(scene) {
  scene.load.image('potion', 'assets/map/itens/potion_noBG.png');
  scene.load.image('shield', 'assets/map/itens/shield_noBG.png');
}

export function createPowerUpSystem(scene, solidLayers) {
  const group = scene.physics.add.group();

  scene.time.addEvent({
    delay: Phaser.Math.Between(SPAWN_MIN, SPAWN_MAX),
    loop: true,
    callback() {
      if (group.countActive(true) >= MAX_POWERUPS) return;

      const w = scene.physics.world.bounds.width;
      const h = scene.physics.world.bounds.height;

      for (let i = 0; i < MAX_TRIES; i++) {
        const x = Phaser.Math.Between(32, w - 32);
        const y = Phaser.Math.Between(32, h - 32);

        // if (solidLayers.some((l) => l.hasTileAtWorldXY(x, y))) continue;

        const key = Phaser.Math.RND.pick(TYPES);
        const item = group.create(x, y, key).setScale(SCALE).setOrigin(0.5).setImmovable(true).setDepth(50);

        item.type = key;
        item.body.setSize(item.displayWidth, item.displayHeight);
      }
    },
  });

  return group;
}
