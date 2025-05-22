import Phaser from 'phaser';

const SPEED = 500;

export function createControls2(scene) {
  const keys = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });
  keys.dash = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
  keys.attack = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  return keys;
}

export function configControls2(player2, keys) {
  const scene = player2.scene;

  if (player2.isHurt) {
    player2.setVelocity(0);
    return;
  }

  if (keys.attack.isDown && !player2.isAttacking && !player2.isDashing) {
    player2.attackSound.play();
    player2.isAttacking = true;
    player2.setFlipX(false);

    const dir = player2.direction || 'down';
    player2.play(`player2_attack_${dir}`, true);

    const offset = 32;
    let x = player2.x,
      y = player2.y,
      w = 40,
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
    player2.attackBox.setSize(w, h).setPosition(x, y);
    player2.attackBox.body.enable = true;

    player2.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      player2.attackBox.body.enable = false;
      player2.attackBox.setVisible(false);
      player2.isAttacking = false;
    });

    player2.setVelocity(0);
    return;
  }

  if (player2.isAttacking) return;

  if (
    Phaser.Input.Keyboard.JustDown(keys.dash) &&
    !player2.isDashing &&
    scene.time.now - player2.lastDashTime >= player2.dashCooldown
  ) {
    player2.isDashing = true;
    player2.lastDashTime = scene.time.now;
    player2.setAlpha(0.5);

    let dx = 0,
      dy = 0;
    switch (player2.direction) {
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
    player2.setVelocity(dx * player2.dashSpeed, dy * player2.dashSpeed);

    scene.time.delayedCall(player2.dashDuration, () => {
      player2.isDashing = false;
      player2.setVelocity(0);
      player2.setAlpha(1);
    });

    return;
  }

  if (player2.isDashing) return;

  player2.setVelocity(0);
  let moving = false;

  if (keys.left.isDown) {
    player2.setFlipX(true);
    player2.play('player2_walk', true);
    player2.setVelocityX(-SPEED);
    player2.direction = 'left';
    moving = true;
  } else if (keys.right.isDown) {
    player2.setFlipX(false);
    player2.play('player2_walk', true);
    player2.setVelocityX(SPEED);
    player2.direction = 'right';
    moving = true;
  } else if (keys.up.isDown) {
    player2.play('player2_walk_down', true);
    player2.setVelocityY(-SPEED);
    player2.direction = 'up';
    moving = true;
  } else if (keys.down.isDown) {
    player2.play('player2_walk_up', true);
    player2.setVelocityY(SPEED);
    player2.direction = 'down';
    moving = true;
  }

  if (!moving) {
    player2.setVelocity(0);
    player2.play('player2_idle', true);
  }
}
