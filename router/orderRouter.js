const express=require('express');
const router=express.Router();
const authenticate=require('../middleware/authenticate');
const Order=require('../models/Order');
const User=require('../models/User');
const {body,validationResult}=require('express-validator');

/**
 * @usage:Place an Order
 * @URL:/api/orders
 * @fields:items,tax,total
 * @method:post
 * @access:PRIVATE
 * 
 * 
 */

router.post('/',authenticate,[

    body('items').notEmpty().withMessage('Items required'),
    body('tax').notEmpty().withMessage('Tax Required'),
    body('total').notEmpty().withMessage('Total Required'),
],async(request,response)=>{
    let errors=validationResult(request);
    if(!errors.isEmpty()){

        return response.status(401).json({errors:errors.array()});
    }
    try{

        let{items,tax,total}=request.body;

        let user=await User.findById(request.user.id);//for user table data
        let order=new Order({

            name:user.name,//from user table
            email:user.email,//from user table
            mobile:user.address.mobile,//from user table 
            total:total,
            tax:tax,
            items:items
        });

        order=await order.save()//save to database
        response.status(200).json({

            msg:'Order is placed',
            order:order
        });


       

    }
    catch(error){

        console.error(error);
        response.status(401).json({errors:[{msg:error.message}]});
    }

});







module.exports=router;