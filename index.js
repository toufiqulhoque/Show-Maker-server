const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()
app.use(cors());
app.use(express.json());
const { MongoClient, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qghtz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)
async function run() {
    try {
        await client.connect();
        const database = client.db("movie-wishlist");
        const serviceCollection = database.collection("serviceDetail")
        const reviewCollection = database.collection("reviewDetail")
        const usersCollection = database.collection("users");
        // const user = { name: 'mahiya mahi', email: 'mahi@gmail.com', descriptio: 'lorem20' }
        // serviceCollection.insertOne(user)

        //Call all service
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const users = await cursor.toArray();
            res.send(users)
        })
        //Add Reviews
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews)
            res.send(result)
        })
        //Add Movies
        app.post('/services', async (req, res) => {
            const newMovies = req.body;
            const result = await serviceCollection.insertOne(newMovies)
            res.send(result)
        })
        //DELETE Movies
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query)
            console.log('deleting user with id', result);
            res.json(result)
        })
        //individual genre
        app.get('/services/genre/:genre', async (req, res) => {
            const genre = req.params.genre;
            const query = { genre: genre }
            console.log(query)
            const options = {}
            const cursor = serviceCollection.find(query, options)
            const result = await cursor.toArray();
            res.send(result);
        })
        //firebase register data in put into database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            console.log(result)
            res.json(result)
        });

        //finding admin role/Check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log('email ::::', email)
            const query = { email: email };
            console.log('query:::', query)
            const user = await usersCollection.findOne(query)
            console.log('user', user)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //   single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const user = await serviceCollection.findOne(query)
            // console.log('load user id', id);
            res.json(user);
        })
    }
    finally {
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})