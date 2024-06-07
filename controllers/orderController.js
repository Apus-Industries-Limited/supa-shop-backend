//  controllers/orderController.js

//  Dummy data for demostration purposes
const orders = [
    { id: 1, item: 'Laptop', quantity: 1 },
    { id: 2, item: 'Phone', quantity: 2 },
];

// Get all orders
exports.getAllorders = (req, res) => { 
    res.status(200).json(orders);
};

//Get order by ID
exports.getOrderById = (req, res) =>
{
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return
    res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
};

// Create a new order
exports.createOrder = (req, res) => {
    const newOrder = {
        id: orders.length + 1,
        item: req.body.item,
        quantity: req.body.quantity,
    };
    orders.push(newOrder);
    res.status(201).json(newOrder);
};

//Update an order
exports.updateOrder = (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return
    res.status(404).json({ message: 'Order not found'});

    order.item =req.body.item ||
    order.item;
    order.quantity =req.body.quantity ||
    order.quantity;
    res.status(200).json(order);
};

// Delete an order
exports.deleteOrder = (req, res) => {
    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (orderIndex === -1) return
    res.status(404).json({ message: 'Order not found'});

    orders.splice(orderIndex, 1);
    res.status(204).send();
};