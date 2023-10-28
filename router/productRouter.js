const express=require('express');
const router=express.Router();
const Product=require('../models/Product');
const authenticate=require('../middleware/authenticate');
const {body,validationResult}=require('express-validator');

/**
 * @usage:Upload a Product
 * @URL:/api/products/upload
 * @fields:name,brand,price,qty,image,category,description,usage
 * @method:POST
 * @access:private
 * 
 * 
 */

router.post('/upload', authenticate,[
    body('name').notEmpty().withMessage("Name is required"),
    body('brand').notEmpty().withMessage("Brand is required"),
    body('price').notEmpty().withMessage("Price is required"),
    body('qty').notEmpty().withMessage("Qty is required"),
    body('image').notEmpty().withMessage("Image is required"),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('usage').notEmpty().withMessage('Use is required')

    
],async(request,response)=>{

    let errors=validationResult(request);
    if(!errors.isEmpty()){

        return response.status(401).json({errors:errors.array()});
    }

    try{

        const{name,brand,price,qty,image,category,description,usage}=request.body;
        let product=new Product({name,brand,price,qty,image,category,description,usage});

        product=await product.save()//save to db
        response.status(200).json({
            msg:"product is uploaded",
            product:product});


    }

    catch(error){

        console.error(error);
        response.status(500).json({erros:[{msg:error.message}]});
    }




});

/**
 * @usage:GET Men's product info
 * @URL:/api/products/men
 * @fields:no-fields
 * @method:get
 * @access:public
 * 
 * 
 */

router.get('/men',async(request,response)=>{

    try{

        let products=await Product.find({category:'MEN'});
        response.status(200).json({
            products:products
        });


    }
    catch(error){

        console.error(error);
        response.status(500).json({errors:[{msg:error.message}]});
    }
});

/**
 * @usage:GET Women's Collection
 * @URL:/api/products/women
 * @fields:no-fields
 * @method:get
 * @access:public
 * 
 * 
 */

router.get('/women',async(request,response)=>{

    try{

        let products=await Product.find({category:'WOMEN'});
        response.status(200).json({products:products});

        
    }
    catch(error){

        console.error(error);
        response.status(401).json({
            errors:[{msg:error.message}]
        });
    }


});

/**
 * @usage:GET Kids's Collection
 * @URL:/api/products/kids
 * @fields:no-fields
 * @method:get
 * @access:public
 * 
 * 
 */

router.get('/kids',async(request,response)=>{

    try{

        let products=await Product.find({category:'KIDS'});
        response.status(200).json({products:products});

        
    }
    catch(error){

        console.error(error);
        response.status(401).json({errors:[{msg:error.message}]});
    }
});


/**
 * @usage:GET a single product
 * @URL:/api/products/:product_id
 * @fields:no-fields
 * @method:get
 * @access:public
 * 
 * 
 */
router.get('/:product_id',async(request,response)=>{
    let productId=request.params.product_id;

    try{

        

        let product=await Product.findById(productId);
        response.status(200).json({product:product});

    }
    catch(error){

        console.error(error);
        response.status(401).json({errors:[{msg:error.message}]});
    }
})


module.exports=router;