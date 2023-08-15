const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Mongodb template

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uetnypa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
    const adminCollections = client.db("JobHunter").collection("admins");

    app.post("/login", async (req, res) => {
      const { email } = req.body;

      // Check if the user exists
      const user = await adminCollections.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ error: true, message: "Invalid credentials" });
      }
      res.json({ user });
    });

    app.post("/logout", (req, res) => {
 
      // Example: Clearing session and user data
      req.session.destroy((err) => {
        if (err) {
          console.error("Error logging out:", err);
          res.status(500).json({ error: "Failed to logout" });
        } else {
          res.status(200).json({ message: "Logged out successfully" });
        }
      });
    });

    // register user
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await adminCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job Hunter is running!");
});

app.listen(port, () => {
  console.log("Listening on port", port);
});
