import EventDispatcher from "./event-dispatcher";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import EnviarConsoleLog1Handler from "../../customer/event/handler/envia-console-log1.handler";
import EnviarConsoleLog2Handler from "../../customer/event/handler/envia-console-log2.handler";
import Customer from "../../customer/entity/customer";
import Address from "../../customer/value-object/address";
import CustomerAddressChangedEvent from "../../customer/event/customer-address-changed.event";
import EnviarConsoleLogHandler from "../../customer/event/handler/envia-console-log.handler";


describe("Domain events tests", () => {
  it("should notify when customer has ben created", () => {
    const eventDispatcher = new EventDispatcher();
    const event1Handler = new EnviarConsoleLog1Handler();
    const event2Handler = new EnviarConsoleLog2Handler();
    const spyEvent1Handler = jest.spyOn(event1Handler, "handle");
    const spyEvent2Handler = jest.spyOn(event2Handler, "handle");

    eventDispatcher.register("CustomerCreatedEvent", event1Handler);
    eventDispatcher.register("CustomerCreatedEvent", event2Handler);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(event1Handler);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(event2Handler);

    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.Address = address;

    const customerCreatedEvent = new CustomerCreatedEvent(customer);

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEvent1Handler).toHaveBeenCalled();
    expect(spyEvent2Handler).toHaveBeenCalled();
  });

  it("should notify when customer change address", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviarConsoleLogHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");
    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"].length
    ).toBe(1);
    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
    ).toMatchObject(eventHandler);


    const customer = new Customer("1", "Customer 1");
    customer.Address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.Address = new Address("Street 2", 444, "13330-250", "Rio de Janeiro");

    const customerCreatedEvent = new CustomerAddressChangedEvent(customer);

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
