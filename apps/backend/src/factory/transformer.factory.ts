import { OrderTransformer } from "../templates/transformer.interface";
import { AmazonTransformer } from "../modules/integrations/amazon/amazon.transformer";
import { BlinkitTransformer } from "../modules/integrations/blinkit/order.transformer";

export function getTransformer(channel: string): OrderTransformer {
  switch (channel.toLowerCase()) {
    case "amazon":
      return new AmazonTransformer();

    case "blinkit":
      return new BlinkitTransformer();

    default:
      throw new Error("Unsupported channel");
  }
}
