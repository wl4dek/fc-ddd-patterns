import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;
  const customerRepository = new CustomerRepository();
  const orderRepository = new OrderRepository();
  const productRepository = new ProductRepository();

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  const initMocks = async () => {
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);
    await orderRepository.create(order);
    return { order, orderItem }
  }

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const { order, orderItem } = await initMocks()
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update a order", async () => {
    const { order, orderItem } = await initMocks()
    order.items.push(new OrderItem('2', 'Teste 2', 25, '123', 2))

    await orderRepository.update(order)
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
        {
          id: "2",
          name: "Teste 2",
          order_id: "123",
          price: 25,
          product_id: "123",
          quantity: 2,
        },
      ],
    });
  });

  it("should find a order by id", async () => {
    const { order, orderItem } = await initMocks()
    const orderModel = await orderRepository.find(order.id);
    expect({
      id: orderModel.id,
      customer_id: orderModel.customerId,
      total: orderModel.total(),
      items: orderModel.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        product_id: item.productId,
      }))
    }).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          product_id: "123",
        },
      ],
    });
  });

  it("should throw an error when order is not found", async () => {
    expect(async () => {
      await orderRepository.find('99999');
    }).rejects.toThrow('Order not found');
  });

  it("should find all order", async () => {
    const { order, orderItem } = await initMocks()
    const orderModels = await orderRepository.findAll();
    expect(orderModels.length).toBeGreaterThan(0)
    const orderModel = orderModels[0]
    expect({
      id: orderModel.id,
      customer_id: orderModel.customerId,
      total: orderModel.total(),
      items: orderModel.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        product_id: item.productId,
      }))
    }).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          product_id: "123",
        },
      ],
    });
  });
});
