const { MongoClient } = require("mongodb");

const DB_NAME = process.env.DB_NAME;
const client = new MongoClient(
  "mongodb+srv://Shashidhar_5:Shashi%40123@cluster0.kms6f.mongodb.net/ReferalLink?retryWrites=true&w=majority"
);

module.exports = {
  db: null,
  users: null,

  async connect() {
    await client.connect();
    console.log("mongodb connected");
    this.db = client.db(DB_NAME);
    this.users = this.db.collection("users");
  },
};
