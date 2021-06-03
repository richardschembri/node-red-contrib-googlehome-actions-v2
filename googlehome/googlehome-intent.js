const Promise = require('promise');

module.exports = function(RED) {

    function GoogleHomeIntentNode(config) {
        console.log("GoogleHomeIntentNode");
        console.log(config);

        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.intent = config.intent;

        this.ask = [];

        this.registerAsk = (ask) => {
          this.ask.push(ask);
        };

        this.on('input', msg => {
            this.debug("GoogleHomeIntentNode - Input Message Received");
            this.log(msg);

			// If msg from Google Home Controller
            if(msg && msg.topic == "googlehome-controller"){
				// Set in Controller
                this.app = msg.payload.getApp();
                this.app.intent(this.intent, (conv, ...params) => {
                  return new Promise( (resolv, reject) => {
                    let count = 0;
                    this.ask.forEach( (c) => {
                      c(conv, params, resolv, reject).then( () => {
                        count ++;
                        if(count == this.ask.length){
                          resolv();
                        }
                      });
                    });
                  });
                });

                this.send({
                  topic: "googlehome-intent",
                  payload: this
                }, false);
            }
        });

        this.on('close', () => {
            console.debug("Closed");
        });
    }
	// Register this node
    RED.nodes.registerType("googlehome-intent", GoogleHomeIntentNode);
};
