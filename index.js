const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

// Middleware
app.use(cors({
  origin: ['https://mern-book-store-frontend.vercel.app', 'http://localhost:5000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

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
    // Connect the client to the server
    await client.connect();
    const bookCollections = client.db("BookInventory").collection("books");

    // Insert a book into the database using POST method
    app.post('/upload-book', async (req, res) => {
      try {
        const data = req.body;
        const result = await bookCollections.insertOne(data);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to upload book' });
      }
    });

    // Get all books
    app.get("/all-books", async (req, res) => {
      try {
        let query = {};
        if (req.query?.category) {
          query = { category: req.query.category };
        }
        const books = bookCollections.find(query);
        const result = await books.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch books' });
      }
    });

    // Update a book's data
    app.patch("/book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateBookData = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = { $set: { ...updateBookData } };

        const result = await bookCollections.updateOne(filter, updateDoc, options);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to update book' });
      }
    });

    // Delete a book's data
    app.delete("/book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await bookCollections.deleteOne(filter);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to delete book' });
      }
    });

    // Get single book data
    app.get("/book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await bookCollections.findOne(filter);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch book' });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
