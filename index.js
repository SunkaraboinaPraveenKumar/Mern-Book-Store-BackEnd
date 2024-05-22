const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

// Middle ware
app.use(cors({
  origin: ['https://mern-book-store-fronend.vercel.app','http://localhost:5000','https://mern-book-store-fronend.vercel.app/admin/dashboard','https://mern-book-store-back-end.vercel.app/','https://mern-book-store-fronend.vercel.app/admin/dashboard/upload','https://mern-book-store-fronend.vercel.app/admin/dashboard/manage','http://localhost:5000/all-books','http://localhost:5000/book/:id'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// MongoDB configuration
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://mern-book-store:PZQN0WWFuxuxyvT6@todolist.1wqqadf.mongodb.net/?retryWrites=true&w=majority&appName=todoList";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Create a collection of documents
    const bookCollections = client.db("BookInventory").collection("books")

    // Insert a book into the database using POST method
    app.post('/upload-book', async (req, res) => {
      const data = req.body;
      const result = await bookCollections.insertOne(data);
      res.send(result)
    })

    // Get all books
    app.get("/all-books", async (req, res) => {
      const books = bookCollections.find();
      const result = await books.toArray();
      res.send(result);
    })

    // Update a book's data: PATCH or UPDATE methods
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          ...updateBookData
        }
      }
      // Update
      const result = await bookCollections.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    // Delete a book's data
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.deleteOne(filter);
      res.send(result);
    });

    // Find by filtering by category
    app.get("/all-books", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category }
      }
      const result = await bookCollections.find(query).toArray();
      res.send(result);
    })

    // Get single book data
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.findOne(filter);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`The server is running on port ${port}`)
})
