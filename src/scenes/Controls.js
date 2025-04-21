const defaultVelocity = 250;
const diagonalVelocity = Math.sqrt((defaultVelocity ** 2) / 2);

export function createControls(scene) {
  return scene.input.keyboard.createCursorKeys();
}

export function configControls(player, controls, scene) {
  let velocityX = 0;
  let velocityY = 0;

  if (controls.right.isDown) {
    velocityX = defaultVelocity;
    player.setFlipX(false);
    player.anims.play("player_walk_right", true);
  }

  if (controls.left.isDown) {
    velocityX = -defaultVelocity;
    player.setFlipX(true);
    player.anims.play("player_walk_left", true);
  }

  if (controls.up.isDown) {
    velocityY = -defaultVelocity;
    player.anims.play("player_walk_up", true);
  }

  if (controls.down.isDown) {
    velocityY = defaultVelocity;
    player.anims.play("player_walk_down", true);
  }

  if (velocityX !== 0 && velocityY !== 0) {
    velocityX = velocityX > 0 ? diagonalVelocity : -diagonalVelocity;
    velocityY = velocityY > 0 ? diagonalVelocity : -diagonalVelocity;
  }

  player.setVelocity(velocityX, velocityY);

  if (velocityX === 0 && velocityY === 0) {
    player.anims.play("player_idle", true);
  }
}