const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const app = express();
const port = 5000;

app.use(cors({
  origin: ['https://mern-book-store-frontend.vercel.app', 'http://localhost:5000', 'http://localhost:5173', 'https://mern-book-store-backend-1.onrender.com'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

const uri = "your_mongodb_uri";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const bookCollections = client.db("BookInventory").collection("books");

    app.post('/upload-book', async (req, res) => {
      try {
        const data = req.body;
        const result = await bookCollections.insertOne(data);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to upload book' });
      }
    });

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

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
