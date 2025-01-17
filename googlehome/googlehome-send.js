const Promise = require('promise');

const {
  dialogflow,
  actionssdk,
  Image,
  Table,
  Carousel,
  LinkOutSuggestion,
  HtmlResponse,
  OpenUrlAction,
  BrowseCarousel,
  Permission,
  Suggestions
} = require('actions-on-google');

module.exports = function(RED) {

    function GoogleHomeSendNode(config) {
        console.log("GoogleHomeSendNode");
        console.log(config);

        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.closeConversation = config.close_conversation;
        this.closeMessage = config.close_message;
        this.continueAfter = config.continue_after;

		// Node Input
        this.on('input', msg => {
            this.debug("GoogleHomeSendNode - Input Message Received");
            this.log(msg);
			// If there is a message object
            if(msg && msg.res !== undefined && msg.res.conv !== undefined){
				// Iterate google home messages if available
              if(msg.gh_messages && msg.gh_messages.length > 0){
                msg.gh_messages.forEach( (m, idx) => {
                    if(m.type !== undefined){
						// Check message type and ask/send accordingly
                        switch(m.type.toLowerCase()){
                            case "simpleresponse":
                                msg.res.conv.ask(m.message);
                                break;

                            case "carousel":
                                msg.res.conv.ask(new Carousel(m.items));
                                break;

                            case "image":
                                msg.res.conv.ask(new Image(m.image));
                                break;

                            case "table":
                                msg.res.conv.ask(new Table(m.table));
                                break;

                            case "link":
                                msg.res.conv.ask(new LinkOutSuggestion(m.link));
                                break;

                            case "html":
                                msg.res.conv.ask(new HtmlResponse(m.link));
                                break;

                            case "open":
                                msg.res.conv.ask(new OpenUrlAction(m.link));
                                break;

                            case "browse":
                                msg.res.conv.ask(new BrowseCarousel(m.link));
                                break;

                            case "permission":
                                msg.res.conv.ask(new Permission(m.permission));
                                break;

                            case "suggestions":
                                msg.res.conv.ask(new Suggestions(m.suggestions));
                                break;
                        }
                    }
                });
              }

              if(!this.continueAfter){
                  if(this.closeConversation){
                      msg.res.conv.close(this.closeMessage);
                  }
                  msg.res.resolv();
              } else {
                  msg.gh_messages = [];
              }
            }
			// Send message object
            this.send(msg);
        });

        this.on('close', () => {
            console.debug("Closed");
        });
    }

    RED.nodes.registerType("googlehome-send", GoogleHomeSendNode);
};
