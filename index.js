const express = require('express');

const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
// const req = require('express/lib/request');
require('dotenv').config();

const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cetyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {

    try {

        await client.connect();
        const database = client.db('Travelogues');

        const blogCollection = database.collection('blogs');
        const postCollection = database.collection('post')
        const reviewCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // blog section
        app.get("/blogs", async (req, res) => {
            const cursor =  blogCollection.find({});
            const blog = await cursor.toArray();
            res.send(blog);
        })

        app.delete("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteBlog = await blogCollection.deleteOne(query);
            res.json(deleteBlog);
          });

        // get single blog api
            
        app.get("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogCollection.findOne(query);
            res.send(blog);
        });

        // post blog api
        app.post("/blogs", async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            res.json(result);
        });

        app.put("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogCollection.updateOne(query);
            res.json(blog);
        });

        // user section
        // user post section
        app.get("/post", async (req, res) => {
            const cursor = postCollection.find({});
            const post = await cursor.toArray();
            res.json(post);
        });

        app.delete("/post/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deletePost = await postCollection.deleteOne(query);
            res.json(deletePost);
        });

        app.get("/post/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const query = await postCollection.findOne(filter);
            res.json(filter);
        });

        app.post("/post", async (req, res) => {
            const post = req.body;
            const result = await postCollection.insertOne(post);
            res.json(result);
        });

        // filter users post with Email - GET
    app.get("/post/:email", async (req, res) => {
        const email = req.params.email;
        const cursor = postCollection.find({});
        const post = await cursor.toArray();
        const customerPost = post.filter((mail) => mail.email === email);
        res.send(customerPost);
    });

        // reviewSection
         // GET REVIEWS - API
         app.get("/reviews", async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // post review to ui
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        // Users section
         // post user
         app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
        // upsert user api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        })
        // make admin user api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        // admin filtering
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({admin: isAdmin})
        })
       

    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running...')
})

app.listen(port, () => {
    console.log('listning to port', port)
})