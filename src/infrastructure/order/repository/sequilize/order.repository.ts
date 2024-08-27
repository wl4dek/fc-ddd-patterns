import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const orderModel = await OrderModel.findOne({
      where: { id: entity.id },
      include: ["items"],
    });

    const orderItems: OrderItemModel[] = await Promise.all(entity.items.map(async (item) => {
      let order = await OrderItemModel.findByPk(item.id)
      if (!order) {
        order = await OrderItemModel.create({
          id: item.id,
          product_id: item.productId,
          order_id: entity.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })
      }
      return order
    }))
    orderModel.total = entity.total()
    orderModel.items = orderItems
    orderModel.save()
  }

  async find(id: string): Promise<Order> {
    let orderModel
    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        include: ["items"],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error('Order not found')
    }

    return this.castOrderModelToOrder(orderModel)
  }

  castOrderModelToOrder(order: OrderModel): Order {
    const orderItems = order.items.map((item) =>
      new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
    )
    return new Order(order.id, order.customer_id, orderItems)
  }

  async findAll(): Promise<Order[]> {
    const ordersModel = await OrderModel.findAndCountAll({
      include: [{ model: OrderItemModel, required: true }],
      limit: 5,
    });

    const orders: Order[] = []

    ordersModel.rows.forEach((order) => {
      orders.push(this.castOrderModelToOrder(order))
    })

    return orders
  }
}
