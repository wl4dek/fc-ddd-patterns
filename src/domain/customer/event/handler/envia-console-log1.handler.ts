
import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerCreatedEvent from "../customer-created.event";

export default class EnviarConsoleLog1Handler
  implements EventHandlerInterface<CustomerCreatedEvent>
{
  handle(_event: CustomerCreatedEvent): void {
    console.log(`Esse é o primeiro console.log do evento: CustomerCreated`);
  }
}
