export default class MainScene extends Phaser.Scene {
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
		this.load.atlas("emoji", "assets/atlases/emoji.png", "assets/atlases/emoji.json")

	}
	  
	create() {
		console.log('create on ' + this.scene.key + ' start');

		var map = this.make.tilemap({key: "map"});
		var tileset = map.addTilesetImage("kenney-tileset-64px-extruded", "kenney-tileset-64px-extruded");
		var groundLayer = map.createStaticLayer("Ground", tileset, 0, 0);
		var lavaLayer = map.createStaticLayer("Lava", tileset, 0, 0);

		// Set colliding tiles before converting the layer to Matter bodies
		groundLayer.setCollisionByProperty({collides: true});
		lavaLayer.setCollisionByProperty({collides: true});
		

		// Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
		// haven't mapped our collision shapes in Tiled so each colliding tile will get a default
		// rectangle body (similar to AP).
		this.matter.world.convertTilemapLayer(groundLayer);
		this.matter.world.convertTilemapLayer(lavaLayer);

	
		// Our canvas is "clickable" so let's update the cursor to a custom pointer
		this.input.setDefaultCursor("url(assets/cursors/pointer.cur), pointer");

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

	
		// --- Code along here ---
		


		//clicking adds emoji
		this.input.on("pointerdown", () => {
			const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
			var x = worldPoint.x;
			var y = worldPoint.y;

			var temp = this.matter.add.sprite(x, y, "emoji", "1f62c", {restitution: 0, friction: 0.0, shape: "circle"});
			temp.setScale(0.5);
		})

		//create an angry emoji => grimace emoji animation
		this.anims.create({
			key: "angry",
			frames: [{key: "emoji", frame: "1f92c"}, {key: "emoji", frame: "1f62c"}],
			frameRate: 8,
			repeat: 0
		});


		//collisions
		// this.matter.world.on("collisionstart", (e) => {
		// 	e.pairs.forEach(pair => {
		// 		const {bodyA, bodyB} = pair;

		// 		const gameObjectA = bodyA.gameObject;
		// 		const gameObjectB = bodyB.gameObject;

		// 		const aIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;
		// 		const bIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;

		// 		if(aIsEmoji) {
		// 			gameObjectA.setAlpha(0.5);
		// 			gameObjectA.play("angry", false);	//false = don't restart animation if it it's alreay playing
		// 		}

		// 		if(bIsEmoji){
		// 			gameObjectB.setAlpha(0.5);
		// 			gameObjectB.play("angry", false);
		// 		}
				

		// 	});
		// });

		// this.matter.world.on("collisionend", (e) => {
		// 	e.pairs.forEach(pair => {
		// 		const {bodyA, bodyB} = pair;

		// 		const gameObjectA = bodyA.gameObject;
		// 		const gameObjectB = bodyB.gameObject;

		// 		const aIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;
		// 		const bIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;

		// 		if(aIsEmoji) {
		// 			gameObjectA.setAlpha(1.0);
		// 		}

		// 		if(bIsEmoji){
		// 			gameObjectB.setAlpha(1.0);
		// 		}
				

		// 	});
		// });

		var bodyOptions = {
			restitution: 1,
			friction: 0,
			shape: "circle"
		};

		var emoji1 = this.matter.add.sprite(250, 100, "emoji", "1f62c", bodyOptions);
		var emoji2 = this.matter.add.sprite(250, 275, "emoji", "1f62c", bodyOptions);

		//use plugin for collisions
		console.log(this)
		this.matterCollision.addOnCollideStart({
			objectA: emoji1,
			objectB: emoji2,
			callback: ({gameObjectA, gameObjectB}) => {
				gameObjectA.play("angry", false);
				gameObjectB.play("angry", false);
			}
		})




		//camera controls
		var cameraCursors = this.input.keyboard.createCursorKeys();
		var cameraConfig = {
			camera: this.cameras.main,
			up: cameraCursors.up,
			down: cameraCursors.down,
			left: cameraCursors.left,
			right: cameraCursors.right,
			speed: 0.5
		};
		this.cameraControls = new Phaser.Cameras.Controls.FixedKeyControl(cameraConfig);
	
	}
	  
	update(timeElapsed, dt) {
		this.cameraControls.update(dt);
	}
}

