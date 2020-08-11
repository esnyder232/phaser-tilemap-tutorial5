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
		var cratesLayer = map.getObjectLayer("Crates").objects;
		var platformLayer = map.getObjectLayer("Platform Locations").objects;

		//load up some crates from the "Crates" object layer creaed in Tiled
		for(var i = 0; i < cratesLayer.length; i++)
		{
			var {x, y, width, height} = cratesLayer[i];
	  
			// Tiled origin for its coordinate system is (0, 1), but we want coordinates relative to an
			// origin of (0.5, 0.5)
			this.matter.add
			.image(x + width /2, y - height / 2, "block")
			.setBody({shape: "rectangle", density: 0.001});
		}

		//create platforms at the point locations in the "Platform Locations" later created in Tiled
		for(var i = 0; i < platformLayer.length; i++)
		{
			createRotatingPlatform(this, platformLayer[i].x, platformLayer[i].y)
		}
		



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
		
		//celebration sensor
		//create a sensor at the rectangle object created in Tiled (under the "Sensors" layer)
		const rect = map.findObject("Sensors", (obj) => {
			return obj.name === "Celebration";
		})

		const celebrateSensor = this.matter.add.rectangle(
			rect.x + rect.width / 2,
			rect.y + rect.height / 2,
			rect.width,
			rect.height,
			{
				isSensor: true, //It shouldn't phsyically interact with other bodies
				isStatic: true //It shouldn't move
			}
		);

		this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
			objectA: this.player.sprite,
			objectB: celebrateSensor,
			callback: this.onPlayerWin,
			context: this
		})


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
			this.unsubscribeCelebrate();

			this.player.freeze();
			const cam = this.cameras.main;
			cam.fade(250, 0, 0, 0);
			cam.once("camerafadeoutcomplete", () => {
				this.scene.restart();
			})
		}
	}

	onPlayerWin() {
		//celebrate only once
		this.unsubscribeCelebrate();

		//drop some heart-eye emojis, of course
		for(var i = 0; i < 35; i++)
		{
			const x = this.player.sprite.x + Phaser.Math.RND.integerInRange(-50, 50);
			const y = this.player.sprite.y - 150 + Phaser.Math.RND.integerInRange(-10, 10);

			this.matter.add
			.image(x, y, "emoji", "1f68d", {
				restitution: 1,
				friction: 0,
				density: 0.0001,
				shape: "circle"
			})
			.setScale(0.5);
			
		}
	}

	  
	update(timeElapsed, dt) {
		// this.cameraControls.update(dt);
	}
}

