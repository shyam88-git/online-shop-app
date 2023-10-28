const express=require('express');
const app=express();
const cors=require('cors');
const dotEnv=require('dotenv');
const mongoose=require('mongoose');
const path=require('path');


//configure the corse

app.use(cors());


//configure the express to receive the form data

app.use(express.json());


//configure dotenv

dotEnv.config({path:'./.env'});


const port=process.env.PORT||5000;

//conigure the mongodb connection


if(process.env.NODE_ENV==='production'){

    app.use(express.static(path.join(__dirname,'client','build')));
    app.get('/',(request,response)=>{

        response.sendFile(path.join(__dirname,'client','build','index.html'));
    });
}

//connect to mongodb connection

mongoose.connect(process.env.MONGO_DB_CLOUD_URL).then((response)=>{
    console.log("Connected to mongodb successfully..........");



}).catch((error)=>{

    console.error(error);
    process.exit(1);
});

//router configuration

app.use('/api/users',require('./router/userRouter'));
app.use('/api/payments',require('./router/paymentRouter'));
app.use('/api/products',require('./router/productRouter'));
app.use('/api/orders',require('./router/orderRouter'));

app.listen(port,()=>{

    console.log(`Express Server is started at PORT:${port}`);
});







