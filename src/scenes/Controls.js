const SPEED = 2500;

export function createControls(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  cursors.shift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  return cursors;
}

export function configControls(player, cursors) {
  const scene = player.scene;

  if (player.isHurt || player.isAttacking) {
    player.setVelocity(0);
    return;
  }

  if (cursors.space.isDown && !player.isAttacking && !player.isDashing) {
    player.isAttacking = true;
    player.setFlipX(false);

    const dir = player.direction || 'down';
    player.play(`player_attack_${dir}`, true);

    const offset = 32;
    let x = player.x,
      y = player.y;
    let w = 40,
      h = 20;

    switch (dir) {
      case 'up':
        w = 50;
        h = 80;
        y -= offset + 20;
        break;
      case 'down':
        w = 50;
        h = 80;
        y += offset + 20;
        break;
      case 'left':
        w = 80;
        h = 50;
        x -= offset + 20;
        break;
      case 'right':
        w = 80;
        h = 50;
        x += offset + 20;
        break;
    }

    player.attackBox.setSize(w, h).setPosition(x, y);
    player.attackBox.body.enable = true;
    player.attackBox.setVisible(true);

    player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      player.attackBox.body.enable = false;
      player.isAttacking = false;
      player.attackBox.setVisible(false);
    });

    player.setVelocity(0);
    return;
  }

  if (cursors.left.isDown) player.direction = 'left';
  else if (cursors.right.isDown) player.direction = 'right';
  else if (cursors.up.isDown) player.direction = 'up';
  else if (cursors.down.isDown) player.direction = 'down';

  if (
    Phaser.Input.Keyboard.JustDown(cursors.shift) &&
    !player.isDashing &&
    scene.time.now - player.lastDashTime >= player.dashCooldown
  ) {
    player.isDashing = true;
    player.lastDashTime = scene.time.now;
    player.setAlpha(0.5);

    let dx = 0,
      dy = 0;
    switch (player.direction) {
      case 'left':
        dx = -1;
        break;
      case 'right':
        dx = 1;
        break;
      case 'up':
        dy = -1;
        break;
      case 'down':
        dy = 1;
        break;
    }

    player.setVelocity(dx * player.dashSpeed, dy * player.dashSpeed);

    scene.time.delayedCall(player.dashDuration, () => {
      player.isDashing = false;
      player.setVelocity(0);
      player.setAlpha(1);
    });

    return;
  }

  if (player.isDashing) return;

  player.setVelocity(0);
  let moving = false;

  if (cursors.left.isDown) {
    player.setFlipX(true);
    player.play('player_walk', true);
    player.setVelocityX(-SPEED);
    player.direction = 'left';
    moving = true;
  } else if (cursors.right.isDown) {
    player.setFlipX(false);
    player.play('player_walk', true);
    player.setVelocityX(SPEED);
    player.direction = 'right';
    moving = true;
  } else if (cursors.up.isDown) {
    player.play('walk_down', true);
    player.setVelocityY(-SPEED);
    player.direction = 'up';
    moving = true;
  } else if (cursors.down.isDown) {
    player.play('walk_up', true);
    player.setVelocityY(SPEED);
    player.direction = 'down';
    moving = true;
  }

  if (!moving) {
    player.setVelocity(0);
    player.play('player_idle', true);
  }
}
