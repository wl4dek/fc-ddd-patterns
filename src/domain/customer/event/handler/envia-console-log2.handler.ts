
import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerCreatedEvent from "../customer-created.event";

export default class EnviarConsoleLog2Handler
  implements EventHandlerInterface<CustomerCreatedEvent>
{
  handle(_event: CustomerCreatedEvent): void {
    console.log(`Esse é o segundo console.log do evento: CustomerCreated`);
  }
}
