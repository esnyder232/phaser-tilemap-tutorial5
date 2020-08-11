import Phaser from "phaser"
import MultiKey from "./multi-key.js"

export default class Player {
	constructor(scene, x, y) {
		this.scene = scene;

		//create the animation we need from the player spritesheet
		var anims = scene.anims;
		anims.create({
			key: "player-idle",
			frames: anims.generateFrameNumbers("player", {start: 0, end: 3}),
			frameRate: 3,
			repeat: -1
		});

		anims.create({
			key: "player-run",
			frames: anims.generateFrameNumbers("player", {start: 8, end: 15}),
			frameRate: 12,
			repeat: -1
		});

		//create the physics-based sprite that we will move around and animate

		this.sprite = scene.matter.add.sprite(0, 0, "player", 0);
		
		const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules
		const { width: w, height: h } = this.sprite;

		const mainBody = Bodies.rectangle(0, 0, w * 0.6, h, { chamfer: { radius: 10 } });
		this.sensors = {
			bottom: Bodies.rectangle(0, h * 0.5, w * 0.25, 2, { isSensor: true }),
			left: Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { isSensor: true }),
			right: Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { isSensor: true })
		}
		// const bottomSensor = Bodies.rectangle(0, h * 0.5, w * 0.25, 2, { isSensor: true });
		// const leftSensor = Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { isSensor: true });
		// const rightSensor = Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { isSensor: true });

		const compoundBody = Body.create({
		  parts: [mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
			frictionStatic: 0,
			frictionAir: 0.02,
			friction: 0.1
		});

		this.sprite.setExistingBody(compoundBody);
		this.sprite.setScale(2);
		this.sprite.setFixedRotation();
		this.sprite.setPosition(x, y);

		//fixes the sprite so its drawn at the center of the displayOriginX,Y again (you have to do this when you add multiple bodies in MatterJS)
		this.sprite.setOrigin((this.sprite.displayOriginY / this.sprite.height) + 0.5, (this.sprite.displayOriginX / this.sprite.width) + 0.5);
		

		//controls
		const {LEFT, RIGHT, UP, A, D, W} = Phaser.Input.Keyboard.KeyCodes;

		console.log(Phaser.Input.Keyboard);

		this.leftInput = new MultiKey(scene, [LEFT, A]);
		this.rightInput = new MultiKey(scene, [RIGHT, D]);
		this.jumpInput = new MultiKey(scene, [UP, W]);

		//track which sensors are touching something
		this.isTouching = {left: false, right: false, ground:false};

		//jumping is going to have a cooldown
		this.canJump = true;
		this.jumpCooldownTimer = null;

		//before matter's update, reset our recor of what surfaces the player is touching.
		this.scene.matter.world.on("beforeupdate", this.resetTouching, this);

		// If a sensor just started colliding with something, or it continues to collide with something,
		// call onSensorCollide
		this.scene.matterCollision.addOnCollideStart({
			objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
			callback: this.onSensorCollide,
			context: this
		});

		this.scene.matterCollision.addOnCollideActive({
			objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
			callback: this.onSensorCollide,
			context: this
		});

		this.destroyed = false;
		this.scene.events.on("update", this.update, this);
		this.scene.events.once("shutdown", this.destroy, this);
		this.scene.events.once("destroy", this.destroy, this);
	}


	onSensorCollide({bodyA, bodyB, pair}) {
		//we only care about colisions with physical objects
		if(bodyB.isSensor) {
			return;
		}

		if(bodyA === this.sensors.left) {
			this.isTouching.left = true;
			if(pair.separation > 0.5) {
				this.sprite.x += pair.separation - 0.5;
			}
		}
		else if(bodyA === this.sensors.right) {
			this.isTouching.right = true;
			if(pair.separation > 0.5) {
				this.sprite.x -= pair.separation - 0.5;
			}
		}
		else if(bodyA === this.sensors.bottom) {
			this.isTouching.ground = true;
		}
	}


	resetTouching() {
		this.isTouching.left = false;
		this.isTouching.right = false;
		this.isTouching.ground = false;
	}


	freeze() {
		this.sprite.setStatic(true);
	}

	update() {
		if(this.destroyed) {
			return;
		}

		const v = this.sprite.body.velocity;
		const isRightKeyDown = this.rightInput.isDown();
		const isLeftKeyDown = this.leftInput.isDown();
		const isJumpKeyDown = this.jumpInput.isDown();
		const isOnGround = this.isTouching.ground;
		const isInAir = !isOnGround;

		const moveForce = isOnGround ? 0.01 : 0.005;

		if(isLeftKeyDown) {
			this.sprite.setFlipX(true);

			//don't let the player push things left if they are in the air
			if(!(isInAir && this.isTouching.left)) {
				this.sprite.applyForce({x: -moveForce, y: 0});
			}
		}
		else if (isRightKeyDown) {
			this.sprite.setFlipX(false);

			//don't let the player push things right if they are in the air
			if(!(isInAir && this.isTouching.right)) {
				this.sprite.applyForce({x: moveForce, y: 0});
			}
		}

		// Limit horizontal speed, without this the player's velocity would just keep increasing to
		// absurd speeds. We don't want to touch the vertical velocity though, so that we don't
		// interfere with gravity.
		if(v.x > 7) {
			this.sprite.setVelocityX(7);
		}
		else if (v.x < -7) {
			this.sprite.setVelocityX(-7);
		}

		if(isJumpKeyDown && this.canJump) {
			this.sprite.setVelocityY(-11);

			// Add a slight delay between jumps since the bottom sensor will still collide for a few
			// frames after a jump is initiated
			this.canJump = false;
			this.jumpCooldownTimer = this.scene.time.addEvent({
				delay:250,
				callback: () => {this.canJump = true;}
			});
		}

		//update the animation/texture based on the state of the player's state
		if(isOnGround) {
			if(this.sprite.body.force.x !== 0) {
				this.sprite.anims.play("player-run", true);
			}
			else {
				this.sprite.anims.play("player-idle", true);
			}
		}
		else {
			this.sprite.anims.stop();
			this.sprite.setTexture("player", 10);
		}

	}

	destroy() {
		this.destroyed = true;

		//event listeners
		this.scene.events.off("update", this.update, this);
		this.scene.events.off("shutdown", this.destroy, this);
		this.scene.events.off("destroy", this.destroy, this);

		if(this.scene.matter.world) {
			this.scene.matter.world.off("beforeupdate", this.resetTouching, this);
		}

		//matter collision plugin
		const sensors = [this.sensors.bottom, this.sensors.left, this.sensors.right];
		this.scene.matterCollision.removeOnCollideStart({objectA: sensors});
		this.scene.matterCollision.removeOnCollideActive({objectA: sensors});

		//don't want any timers triggering post-mortem
		if(this.jumpCooldownTimer) {
			this.jumpCooldownTimer.destroy();
		}

		this.sprite.destroy();
	}
}