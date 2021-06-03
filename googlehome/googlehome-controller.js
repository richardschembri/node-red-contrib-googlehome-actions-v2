const Promise = require('promise');
const {
  dialogflow,
  actionssdk,
  Image,
  Table,
  Carousel,
} = require('actions-on-google');

module.exports = function(RED) {

    function GoogleHomeControllerNode(config) {

        RED.nodes.createNode(this, config);

        console.log("GoogleHomeControllerNode");
        console.log(config);

        this.name = config.name;

        this.app = dialogflow(); // Actions on Google Dialogflow

        this.getApp = () => {
          return this.app;
        };

		RED.events.on('flows:started', msg => {
          this.log("Sending Controller");
		  // Forward to next node
          this.send([{
            topic: "googlehome-controller",
            payload: this
          }, null], false);
        });

        this.on('input', msg => {
            console.debug("GoogleHomeControllerNode - Input Message Received");
            console.log(msg);
			// Parse payload and request
            if(msg && msg.payload && msg.req && msg.res){
              this.app(msg.payload, msg.req.headers).then( (res) => {
                this.warn("Finish Intent");
                this.warn(res);

				// Multiple outputs, second output is for HTTP response
				// - First : null (for the sake of continueing the flow)
				// - Second: HTTP Response
                this.send([null,{
                  payload: res.body,
                  headers: res.headers,
                  statusCode: res.status,
                  req: msg.req,
                  res: msg.res
                }]);
              }).catch( (err) => {
                this.log("ERROR");
                this.log(err);
              });
            }
        });

        this.on('close', () => {
            console.debug("Closed");
        });

    }

	// Register this node
    RED.nodes.registerType("googlehome-controller", GoogleHomeControllerNode);
};
