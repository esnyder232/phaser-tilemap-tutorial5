import Phaser from "phaser"
import Player from "../classes/player.js"
import createRotatingPlatform from "../classes/create-rotating-platform.js"

export default class PlatformScene extends Phaser.Scene {
	constructor(config) {
		super(config);
	}

	init() {
		console.log('init on ' + this.scene.key + ' start');

	}

	preload() {
		console.log('preload on ' + this.scene.key + ' start');

		this.load.tilemapTiledJSON("map", "assets/tilemaps/level.json");
		this.load.image("kenney-tileset-64px-extruded", "assets/tilesets/kenney-tileset-64px-extruded.png");

		this.load.atlas("emoji", "assets/atlases/emoji.png", "assets/atlases/emoji.json");

		this.load.image("wooden-plank", "assets/images/wooden-plank.png");
		this.load.image("block", "assets/images/block.png");

		this.load.spritesheet(
			"player",
			"assets/spritesheets/0x72-industrial-player-32px-extruded.png",
			{
				frameWidth: 32,
				frameHeight: 32,
				margin: 1,
				spacing: 2
			}
		)
	}
	  
	create() {
		console.log('create on ' + this.scene.key + ' start');

		//tilemap
		var map = this.make.tilemap({key: "map"});
		var tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
		var groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
		var lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);
		map.createDynamicLayer("Background", tileset, 0, 0);
		map.createDynamicLayer("Foreground", tileset, 0, 0);

		//tilemap collisions
		groundLayer.setCollisionByProperty({collides: true});
		lavaLayer.setCollisionByProperty({collides: true});

		this.matter.world.convertTilemapLayer(groundLayer);
		this.matter.world.convertTilemapLayer(lavaLayer);

		//camera controls
		this.cameras.main.setBounds(0 ,0, map.widthInPixels, map.heightInPixels);

		// var cameraCursors = this.input.keyboard.createCursorKeys();
		// var cameraConfig = {
		// 	camera: this.cameras.main,
		// 	up: cameraCursors.up,
		// 	down: cameraCursors.down,
		// 	left: cameraCursors.left,
		// 	right: cameraCursors.right,
		// 	speed: 0.5
		// };

		// this.cameraControls = new Phaser.Cameras.Controls.FixedKeyControl(cameraConfig);

		//help
		var help = this.add.text(16, 16, "Arrows/WASD to move the player.", {
			fontSize: "18px",
			padding: {x: 10, y: 5},
			backgroundColor: "#ffffff",
			fill: "#000000"
		});
		help.setScrollFactor(0);


		//player
		var {x, y} = map.findObject("Spawn", obj => {return obj.name === "Spawn Point"});
		console.log('spawn point: x:' + x + ". y:" + y);
		this.player = new Player(this, 300, 100);

		//player collision for lava/spikes
		this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
			objectA: this.player.sprite,
			callback: this.onPlayerCollide,
			context: this
		});
		
		//smooth camera
		this.cameras.main.startFollow(this.player.sprite, false, 0.5, 0.5);
		
	}

	onPlayerCollide({gameObjectB}) {
		if(!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) {
			return;
		}

		const tile = gameObjectB;

		// Check the tile property set in Tiled (you could also just check the index if you aren't using
		// Tiled in your game)
		if(tile.properties.isLethal) {
			this.unsubscribePlayerCollide();

			this.player.freeze();
			const cam = this.cameras.main;
			cam.fade(250, 0, 0, 0);
			cam.once("camerafadeoutcomplete", () => {
				this.scene.restart();
			})
		}

	}

	  
	update(timeElapsed, dt) {
		// this.cameraControls.update(dt);
	}
}

