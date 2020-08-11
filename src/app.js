import Phaser from 'phaser';
import GameManagerScene from './scenes/game-manager-scene.js'

import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin"

export default class App {
	constructor() {
		this.game = {};
		this.config = {};

		this.config = {
			type: Phaser.AUTO,
			backgroundColor: '#333333',
			width: 800,
			height:600,
			parent: 'game-div',
			physics: {
				default: 'matter',				
				matter: {
					debug: true,
					gravity: {
						y: 1
					}
				}
			},
			scale: {
				zoom:1
			},
			plugins: {
				scene: [
					{
						plugin: PhaserMatterCollisionPlugin, //the plugin class
						key: "matterCollision", //where to store in scene.systems, e.g. scene.sys.matterCollision
						mapping: "matterCollision" //where t ostore in the scene, e.g. scene.matterCollision
					}
				]
			}
		}

		this.game = new Phaser.Game(this.config);
		this.game.scene.add('game-manager-scene', GameManagerScene, true);
	}	
}

//feels like a hacky way to start...oh well. Its simple atleast.
var app = new App();

