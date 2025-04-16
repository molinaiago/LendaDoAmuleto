const defaultVelocity = 250; 

export function createControls(scene) {
  return scene.input.keyboard.createCursorKeys();
}

export function configControls(player, controls, scene) {
  player.setVelocity(0);
  player.setVelocityY(0);

  let moving = false;

  if (controls.right.isDown) {
    player.setFlipX(false);
    player.anims.play("player_walk", true);
    player.setVelocityX(defaultVelocity);
    moving = true;
  } 
  else if (controls.left.isDown) {
    player.setFlipX(true);
    player.anims.play("player_walk", true);
    player.setVelocityX(-defaultVelocity);
    moving = true;
  } 
  else if (controls.up.isDown) {
    player.anims.play("walk_down", true);
    player.setVelocityY(-defaultVelocity);
    moving = true;
  } 
  else if (controls.down.isDown) {
    player.anims.play("walk_up", true);
    player.setVelocityY(defaultVelocity);
    moving = true;
  }

  if (!moving) {
    player.anims.play("player_idle", true);
  }
}