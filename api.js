var express = require('express');
var app = express();
var port = process.env.PORT || 7800;
var bodyparser = require('body-parser');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var mongourl = "mongodb+srv://user-adarsh:mongodbadarsh@cluster0.mppah.mongodb.net/restaurent?retryWrites=true&w=majority";
var cors = require('cors');
var db;

//We have to use CORS to connect backend with frontend
app.use(cors());


//use of body parser to encode the data
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json())

//List of all City
app.get('/location',(req,res) => {
    db.collection('city').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//List of all MealType
app.get('/mealtype',(req,res) => {
    db.collection('mealtype').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//List of all Cuisine
app.get('/cuisine',(req,res) => {
    db.collection('cuisine').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//List of all Restaurent and with some input by user
app.get('/restaurents',(req,res) => {
    var condition = {};
    if(req.query.city && req.query.mealtype){
        condition = {city:req.query.city,"type.mealtype":req.query.mealtype}
    }else if(req.query.city){
        condition={city:req.query.city}
    }else if(req.query.mealtype){
        condition={"type.mealtype":req.query.mealtype}
    }else{
        condition={}
    }
    db.collection('restaurent').find(condition).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//RestaurentDetail of specific ID
app.get('/restaurantdetails/:id',(req,res) => {
    var condition = {_id:req.params.id}
    db.collection('restaurent').find(condition).toArray((err,result) => {
        res.send(result)
    })
})

//RestaurentList with MealType & cuisine & city
app.get('/restaurantList/:mealtype',(req,res) => {
    var condition = {};
    var sort = {cost:-1};
    if(req.query.cuisine){
        condition={"type.mealtype":req.params.mealtype,"Cuisine.cuisine":req.query.cuisine}
    }else if(req.query.city){
        condition={"type.mealtype":req.params.mealtype,city:req.query.city}
    }else if(req.query.lcost && req.query.hcost){
        condition={"type.mealtype":req.params.mealtype,cost:{$lt:Number(req.query.hcost),$gt:Number(req.query.lcost)}}
    }else if(req.query.sort){
        condition={"type.mealtype":req.params.mealtype}
        sort={cost:Number(req.query.sort)}
    }
    db.collection('restaurent').find(condition).sort(sort).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//PlaceOrder
app.post('/placeorder',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('posted')
    })
})

//Add Restaurent
app.post('/addrestaurent',(req,res) => {
    console.log(req.body);
    db.collection('restaurent').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('posted')
    })
})

//Delete Restaurant
app.delete('/deleterest',(req,res) => {
    db.collection('restaurent').remove({_id:req.body.id},(err,result) => {
        if(err) throw err;
        res.send('data deleted')
    })
})

//Update Restaurent
app.put('/updateRest',(req,res) => {
    db.collection('restaurent').update({_id:req.body._id},
        {
            $set:{
                rest_name:req.body.rest_name,
                city_name:req.body.city_name,
                city:req.body.city,
                area:req.body.area,
                locality:req.body.locality,
                cost:req.body.cost,
                address:req.body.address,
                contact_number:req.body.contact_number,
                type:[
                    {
                        mealtype:req.body.type[0].mealtype,
                        name:req.body.type[0].name
                    },
                    {
                        mealtype:req.body.type[1].mealtype,
                        name:req.body.type[1].name
                     }
                ],
                Cuisine:[
                    {
                        cuisine:req.body.Cuisine[0].cuisine,
                        name:req.body.Cuisine[0].name
                    },
                    {
                        cuisine:req.body.Cuisine[1].cuisine,
                        name:req.body.Cuisine[1].name
                    }
                ]
            }
        },(err,result) => {
            if(err) throw err;
            res.send('data updated')
        })
})

//order
app.get('/orders',(req,res) => {
    db.collection('orders').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//Delete orders
app.delete('/deleteorders',(req,res) => {
    db.collection('orders').remove({_id:req.body.id},(err,result) => {
        if(err) throw err;
        res.send('data deleted')
    })
})


//Connecting with mongodb client
MongoClient.connect(mongourl,(err,connection) => {
    if(err) throw err;
    db = connection.db('restaurent')
    app.listen(port,(err) => {
        if(err) throw err;
        console.log(`Server is running ${port}`);
    })
})
