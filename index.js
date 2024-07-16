const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express()
require('dotenv').config()

console.log(process.env.DATABASE_USER);


app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send('online mone server running')
})



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.cd4uzfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const usersDatabase = client.db("online-moneyDB").collection("online-money-allusers");

        //rejister related api
        app.post("/newUser", async (req, res) => {
            const userinfo = req.body
            const emailFilter = { email: userinfo.email }
            const numberFilter = { phone: userinfo.phone }
            const emailResult = await usersDatabase.findOne(emailFilter)
            const phoneResult = await usersDatabase.findOne(numberFilter)
            if (emailResult) {
                return res.send({ message: "email already Used" })
            }
            if (phoneResult) {
                return res.send({ message: "Number already Used" })
            }
            const result = await usersDatabase.insertOne(userinfo)
            res.send(result)

        })



        //login related api
        app.post("/login", async (req, res) => {
            const loginInfo = req.body

            const emailFilter = { email: loginInfo.emailorPhone }
            const emailResult = await usersDatabase.findOne(emailFilter)

            const phoneFilter = { phone: loginInfo.emailorPhone }
            const phoneResult = await usersDatabase.findOne(phoneFilter)

            const pinFilter = { pin: loginInfo.pin }
            const pinResult = await usersDatabase.findOne(pinFilter)

            const emailorPhone = emailResult || phoneResult



            if (emailorPhone && pinResult) {
                return res.send({ message: "success" })
            } else { return res.send({ message: "fail" }) }

        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.log);






app.listen(port, () => {
    console.log("server ok");
})
