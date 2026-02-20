"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransformer = getTransformer;
const amazon_transformer_1 = require("../modules/integrations/amazon/amazon.transformer");
const order_transformer_1 = require("../modules/integrations/blinkit/order.transformer");
function getTransformer(channel) {
    switch (channel.toLowerCase()) {
        case "amazon":
            return new amazon_transformer_1.AmazonTransformer();
        case "blinkit":
            return new order_transformer_1.BlinkitTransformer();
        default:
            throw new Error("Unsupported channel");
    }
}
