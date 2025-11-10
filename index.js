const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 3000;
// middleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bmnsbh2.mongodb.net/?appName=Cluster0`;
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
    const db = client.db("ai-model-inventory-db");

    const ModelCollection = db.collection("models");
    const PurchasedCollection = db.collection("purchased-models");

    app.get("/models", async (req, res) => {
      const result = await ModelCollection.find().toArray();
      res.send(result);
    });

    // details model api

    app.get("/models/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ModelCollection.findOne(query);
      res.send(result);
    });

    // add new model api
    app.post("/models", async (req, res) => {
      const data = req.body;
      const result = await ModelCollection.insertOne(data);
      res.send(result);
    });

    // update model api
    app.put("/update-model/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };
      const result = await ModelCollection.updateOne(query, update);
      res.send(result);
    });

    // my models api

    app.get("/my-models", async (req, res) => {
      const email = req.query.email;
      const result = await ModelCollection.find({ createdBy: email }).toArray();
      res.send(result);
    });

    // delete APi
    app.delete("/models/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ModelCollection.deleteOne(query);
      res.send(result);
    });

    // purchased model add to db api

    app.post("/purchased-models/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const result = await PurchasedCollection.insertOne(data);

      const purchasedCount = {
        $inc: { purchased: 1 },
      };
      const updatedPurchased = await ModelCollection.updateOne(
        query,
        purchasedCount
      );
      res.send(result);
    });
    // purchased model get api
    app.get("/my-purchased-models", async (req, res) => {
      const email = req.query.email;

      const result = await PurchasedCollection.find({
        purchasedBy: email,
      }).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
