/**
 * A small class to allow multiple Phaser keys to treated as one input. E.g. the left arrow and "A"
 * key can be wrapped up into one "input" so that we can check whether the player pressed either
 * button.
 */

export default class MultiKey {
	constructor(scene, keyCodes) {
		this.scene = scene;
		this.keys = [];

		if(!Array.isArray(keyCodes)) {
			keyCodes = [keyCodes];
		} 

		for(var i = 0; i < keyCodes.length; i++)
		{
			var temp = scene.input.keyboard.addKey(keyCodes[i]);
			this.keys.push(temp);
		}

		console.log(this.keys);
	}


	//are any of the keys down?
	isDown() {
		return this.keys.some(key => key.isDown);
	}

	//Are all of the keys up?
	isUp() {
		return this.keys.every(key => key.isUp);
	}
}