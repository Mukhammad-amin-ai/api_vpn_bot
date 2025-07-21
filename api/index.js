import Express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import router from "../router/index.js";
import dotenv from "dotenv";
const app = Express();

const PORT = process.env.PORT || 3001;

const envFile = process.env.NODE_ENV === "local" ? ".env.local" : ".env";
delete process.env.MONGODB_URI;
dotenv.config({ path: envFile });
const DB = process.env.MONGODB_URI;

app.use(Express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use("/api", router);

const StarterFunc = async () => {
  try {
    await mongoose.connect(DB);
    app.listen(PORT, () => {
      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log("Loaded from:", envFile);
      console.log(
        "MONGODB_URI:",
        process.env.MONGODB_URI
      );

      console.log(
        `\x1b[40m`,
        `\x1b[32m`,
        `
        ================================
        
       ___  __  ___  _______  _______
      / _ \\/ / / / |/ /  _/ |/ / ___/
     / , _/ /_/ /    // //    / (_ / 
    /_/|_|\\____/_/|_/___/_/|_/\\___/  
    
    []:${PORT}
    =================================                            
`,
        `\x1b[0m`
      );
    });
  } catch (e) {
    console.error(e);
  }
};

StarterFunc().then(() => console.log("Server started successfully!"));
