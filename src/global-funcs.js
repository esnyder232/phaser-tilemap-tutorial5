var tempGlobalMessages = [];

export default class GlobalFuncs {
	constructor() {
		this.tempGlobalMessages = tempGlobalMessages;
	}

	
	//Helper function to register events to emitters in phaser.
	//scene - the scene
	//eventMapping - array of mappings for events
	// Each mapping needs the following format:
	// eventMapping = [
	// {
	//	 	target: this.load,
	//	 	event: 'progress',
	//	 	delegate: this.loadProgress
	// },
	// {}...
	// ]
	// 		target - the event emitter in phaser
	//		event - the name of the event
	//		delegate - the delegate to call

	registerEvents(scene, eventMapping) {
		for(var i = 0; i < eventMapping.length; i++)
		{
			eventMapping[i].target.on(eventMapping[i].event, eventMapping[i].delegate)
		}
	}

	//Helper function to unregister events from emitters in phaser. This is the opposite of GlobalFuncs.registerEvents().
	//This is to be called in the "shutdown" event.
	unregisterEvents(scene, eventMapping) {
		for(var i = 0; i < eventMapping.length; i++)
		{
			eventMapping[i].target.off(eventMapping[i].event, eventMapping[i].delegate)
		}
	}

	
}