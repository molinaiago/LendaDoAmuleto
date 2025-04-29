const defaultVelocity = 2250;

export function createControls(scene) {
    return scene.input.keyboard.createCursorKeys();
}

export function configControls(player, controls, scene) {
    player.setVelocity(0);
    player.setVelocityY(0);

    let moving = false;

    if (controls.space.isDown && !player.isAttacking) {
        player.isAttacking = true;

        let attackAnimation = "player_attack_" + (player.direction || "down"); 
        player.setFlipX(false);
        player.anims.play(attackAnimation, true);

        player.once('animationcomplete', () => {
            player.isAttacking = false;
        });

        return; 
    }

    if (player.isAttacking) {
        return; 
    }

    if (controls.right.isDown) {
        player.setFlipX(false);
        player.anims.play("player_walk", true);
        player.setVelocityX(defaultVelocity);
        player.direction = "right"; 
        moving = true;
    }
    else if (controls.left.isDown) {
        player.setFlipX(true);
        player.anims.play("player_walk", true);
        player.setVelocityX(-defaultVelocity);
        player.direction = "left"; 
        moving = true;
    }
    else if (controls.up.isDown) {
        player.anims.play("walk_down", true);
        player.setVelocityY(-defaultVelocity);
        player.direction = "up"; 
        moving = true;
    }
    else if (controls.down.isDown) {
        player.anims.play("walk_up", true);
        player.setVelocityY(defaultVelocity);
        player.direction = "down"; 
        moving = true;
    }

    if (!moving) {
        player.anims.play("player_idle", true);
    }
}