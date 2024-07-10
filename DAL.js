//Everything to do with the database is done here in the DAL
//Make sure to move into the finalExpress directory if you aren't and do an npm install
const { MongoClient } = require('mongodb');
const connectionString = ""; //Need to change the mongoDB connection string
const dbName = ""; //Change the dbName
const collectionName = "";//Change the collectionName

exports.DAL = { //Finds a user in the database by username
    getUser: async function (username) {
        const client = new MongoClient(connectionString);
        try {
            const database = client.db(dbName);
            const collection = database.collection(collectionName);
            const query = {username: username};
            const user = await collection.findOne(query, { projection: { username: 1, password: 1, email: 1, age: 1 } });
            if(!user) {
                console.log("User cannot be found");
                return null;
            }
            return user;
        }
        finally {
            await client.close();
        }
    },
    getAllUsers: async function () { //gets all users in the database
        const client = new MongoClient(connectionString);
        try { 
            const database = client.db(dbName);
            const collection = database.collection(collectionName);
            const users = await collection.find({}).toArray();
            return users;
        }
        finally {
            await client.close();
        }
    },
    updateUser: async function (personData, theName) { //updates a user in the database based on userName
        const client = new MongoClient(connectionString);
        try { 
            await client.connect();
            const database = client.db(dbName);
            const collection = database.collection(collectionName);
            const query = { username: theName };
            const update = { $set: personData };
            const result = await collection.updateOne(query, update);
        }
        finally {
            await client.close();
        }
    },
    registerPerson: async function (personData) { //Adds a user to the database
        const client = new MongoClient(connectionString);
        try {
            const database = client.db(dbName);
            const collection = database.collection(collectionName);
            const results = await collection.insertOne(personData);
            console.log(`documents were inserted`);
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }
};