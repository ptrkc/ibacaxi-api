import express from "express";
import cors from "cors";
import { postSignIn, postSignUp, postSignOut } from "./routes/sign.js";
import { getProducts } from "./routes/products.js";
import { getCategories } from "./routes/categories.js";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-in", (req, res) => postSignIn(req, res));

app.post("/sign-up", (req, res) => postSignUp(req, res));

app.post("/sign-out", (req, res) => postSignOut(req, res));

app.get("/products", (req, res) => getProducts(req, res));

app.get("/categories", (req, res) => getCategories(req, res));

export default app;
