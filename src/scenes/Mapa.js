import { configControls, createControls } from "./Controls.js";
import { createPlayer, loadSprites } from "./Player.js";
import {
    loadGoblinSprites,
    createGoblinAnimations,
    createGoblin
} from "./Goblin.js";

export class Mapa extends Phaser.Scene {
    constructor() {
        super("Mapa");
        this.player = null;
        this.goblin = null;
        this.controls = null;
    }

    preload() {
        this.load.tilemapTiledJSON("mapa", "assets/mapa_vila_floresta.json");

        this.load.image("tileset_grass", "assets/map/blocos/tileset_grass.png");
        this.load.image("tileset_water", "assets/map/blocos/tileset_water.png");
        this.load.image("tiled_route", "assets/map/constructions/tiled_route.png");
        this.load.image("tiled_extras", "assets/map/constructions/tiled_extras_noBG.png");
        this.load.image("tileset_houses", "assets/map/constructions/tileset_houses_noBG.png");
        this.load.image("tileset_houses2", "assets/map/constructions/tileset_houses2.png");
        this.load.image("tileset_abandoned_houses", "assets/map/constructions/tileset_abandoned_houses.png");
        this.load.image("tileset_three", "assets/map/constructions/tileset_three_noBG.png");

        loadSprites(this);
        loadGoblinSprites(this);
    }

    create() {
        const map = this.make.tilemap({ key: "mapa" });

        const tilesets = [
            map.addTilesetImage("tileset_grass", "tileset_grass"),
            map.addTilesetImage("tileset_water", "tileset_water"),
            map.addTilesetImage("tiled_route", "tiled_route"),
            map.addTilesetImage("tiled_extras", "tiled_extras"),
            map.addTilesetImage("tileset_houses", "tileset_houses"),
            map.addTilesetImage("tileset_houses2", "tileset_houses2"),
            map.addTilesetImage("tileset_abandoned_houses", "tileset_abandoned_houses"),
            map.addTilesetImage("tileset_three", "tileset_three"),
        ];

        const layer1 = map.createLayer("Camada de Blocos 1", tilesets, 0, 0);
        const layer2 = map.createLayer("Camada de Blocos 2", tilesets, 0, 0);

        layer1.setCollisionByProperty({ collider: true });
        layer2.setCollisionByProperty({ collider: true });

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.player = createPlayer(this);
        this.player.setPosition(64, map.heightInPixels - 64);
        this.player.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.controls = createControls(this);

        this.physics.add.collider(this.player, layer1);
        this.physics.add.collider(this.player, layer2);

        // goblin
        this.goblin = createGoblin(this);
        this.goblin.setPosition(this.player.x + 64, this.player.y);

        this.physics.add.collider(this.player, this.goblin, () => {
            console.log("Colidiu com o goblin!");
        });
    }

    update() {
        configControls(this.player, this.controls);
    }
}