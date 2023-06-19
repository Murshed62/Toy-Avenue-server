const express = require("express");
const cors = require("cors");
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//noSQL database Mongodb code

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cpvz2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const addedToyCollection = client
      .db("toyMarketPlace")
      .collection("products");

      // jwt
      // app.post('/jwt', (req,res) =>{
      //   const user = req.body;
      //   console.log(user);
      //   const token  = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      //     expiresIn: '1h'
      //   });
      //   res.send(token);
      // })

    app.get("/products", async (req, res) => {
      let sortPrice = req.query?.sort;
      let query = {}
      if(sortPrice){
        query = {price:sortPrice} 
      }
      const result = await addedToyCollection.find().sort(query).toArray();
      res.send(result);
      
    });

    app.get("/searchToy/:text", async (req, res) => {
      const text = req.params.text;
      const result = await addedToyCollection
        .find({
          $or: [{ toyName: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const addToy = req.body;

      console.log(addToy);
      const result = await addedToyCollection.insertOne(addToy);
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addedToyCollection.findOne(query);
      res.send(result);
    });
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const updateToy = {
        $set: {
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await addedToyCollection.updateOne(
        filter,
        updateToy,
        options
      );
      res.send(result);
    });
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await addedToyCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    await client.db("toyMarketPlace").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//-------------------------------

app.get("/", (req, res) => {
  res.send("action figure toys");
});

app.listen(port, () => {
  console.log(`action figure toys running on port: ${port}`);
});
