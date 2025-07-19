import Express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import router from "../router/index.js";
import serverless from "serverless-http";

const app = Express();
const PORT = 3000;

const DB = process.env.MONGODB_URI;

app.use(Express.json());
app.use("/api", router);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

const bootstrap = async () => {
  try {
    await mongoose.connect(DB);
    app.listen(PORT, () => {
      console.log(
        `\x1b[40m`,
        `\x1b[32m`,
        `
        ================================
       ___  __  ___  _______  _______
      / _ \\/ / / / |/ /  _/ |/ / ___/
     / , _/ /_/ /    // //    / (_ / 
    /_/|_|\\____/_/|_/___/_/|_/\\___/  
    
    =================================                            
    [+] Server         : http://localhost:${PORT}
    [~] Running Server...
`,
        `\x1b[0m`
      );
    });
  } catch (e) {
    console.error(e);
  }
};

bootstrap();

export default serverless(app);
