export class Mapa extends Phaser.Scene {
    constructor() {
        super('Mapa');
    }

    preload() {
        this.load.tilemapTiledJSON('mapa', 'assets/mapa_vila_floresta.json');
        this.load.image('tileset_grass', 'assets/blocos/tileset_grass.png');
        this.load.image('tileset_water', 'assets/blocos/tileset_water.png');
        this.load.image('tiled_route', 'assets/constructions/tiled_route.png');
        this.load.image('tiled_extras', 'assets/constructions/tiled_extras.png');
        this.load.image('tileset_houses', 'assets/constructions/tileset_houses.png');
        this.load.image('tileset_houses2', 'assets/constructions/tileset_houses2.png');
        this.load.image('tileset_abandoned_houses', 'assets/constructions/tileset_abandoned_houses.png');
        this.load.image('tileset_three', 'assets/constructions/tileset_three.png');
        this.load.image('boss', 'assets/characters/boss.png');
        this.load.image('enemies', 'assets/characters/enemies.png');

        this.load.spritesheet('main_character', 'assets/characters/main_character.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        const map = this.make.tilemap({ key: 'mapa' });

        const tilesets = [
            map.addTilesetImage('tileset_grass', 'tileset_grass'),
            map.addTilesetImage('tileset_water', 'tileset_water'),
            map.addTilesetImage('tiled_route', 'tiled_route'),
            map.addTilesetImage('tiled_extras', 'tiled_extras'),
            map.addTilesetImage('tileset_houses', 'tileset_houses'),
            map.addTilesetImage('tileset_houses2', 'tileset_houses2'),
            map.addTilesetImage('tileset_abandoned_houses', 'tileset_abandoned_houses'),
            map.addTilesetImage('tileset_three', 'tileset_three'),
            map.addTilesetImage('boss', 'boss'),
            map.addTilesetImage('enemies', 'enemies'),
            map.addTilesetImage('main_character', 'main_character')
        ];

        const layer1 = map.createLayer('Camada de Blocos 1', tilesets, 0, 0);
        const layer2 = map.createLayer('Camada de Blocos 2', tilesets, 0, 0);
        const layerInimigos = map.createLayer('inimigos', tilesets, 0, 0);


        layer1.setCollisionByProperty({ collider: true });
        layer2.setCollisionByProperty({ collider: true });
        layerInimigos.setCollisionByProperty({ collider: true });

        this.player = this.physics.add.sprite(100, 100, 'main_character', 0);
        this.player.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('main_character', { start: 9, end: 11 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('main_character', { start: 6, end: 8 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'up', frames: this.anims.generateFrameNumbers('main_character', { start: 3, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'down', frames: this.anims.generateFrameNumbers('main_character', { start: 0, end: 2 }), frameRate: 10, repeat: -1 });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.player, layer1);
        this.physics.add.collider(this.player, layer2);
        this.physics.add.collider(this.player, layerInimigos);


        this.grupoBoss = this.physics.add.group();

        const objetosInimigos = map.getObjectLayer('inimigos')?.objects || [];

        objetosInimigos.forEach(obj => {
            if (obj.type === 'boss') {
                const boss = this.grupoBoss.create(obj.x, obj.y - obj.height, 'boss');
                boss.setCollideWorldBounds(true);
                boss.setImmovable(true);
                boss.setScale(1.5);
                boss.tipo = 'boss'; // pode usar isso depois para lógica personalizada
            }
        });

        // Colisão entre jogador e boss
        this.physics.add.collider(this.player, this.grupoBoss, (player, boss) => {
            console.log('Jogador encontrou o boss!');
        });
    }

    update() {
        const speed = 150;
        const player = this.player;
        const cursors = this.cursors;

        player.setVelocity(0);

        if (cursors.left.isDown) {
            player.setVelocityX(-speed);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(speed);
            player.anims.play('right', true);
        } else if (cursors.up.isDown) {
            player.setVelocityY(-speed);
            player.anims.play('up', true);
        } else if (cursors.down.isDown) {
            player.setVelocityY(speed);
            player.anims.play('down', true);
        } else {
            player.anims.stop();
        }
    }
}
