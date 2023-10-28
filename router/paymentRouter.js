const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const authenticate = require('../middleware/authenticate');

/* 
@usage: Make a Stripe payment
@url: /api/payments/pay
@fields: product, token
@method: POST
@access: PRIVATE
*/

router.post('/pay', (request, response) => {
    const { product, token } = request.body;

    // Create a customer in Stripe
    stripe.customers.create({
        email: token.email,
        source: token.id,
    })
    .then(customer => {
        // Charge the customer
        return stripe.charges.create({
            amount: product.price,
            description: product.name,
            currency: 'INR',
            customer: customer.id
        });
    })
    .then(charge => {
        // Payment was successful
        response.status(200).json(charge);
    })
    .catch(err => {
        // Handle and send an error response
        console.error(err);
        response.status(500).json({ error: 'Payment failed.' });
    });
});

module.exports = router;
