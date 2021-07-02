import express from "express";
import cors from "cors";
import { postSignIn, postSignUp, postSignOut } from "./routes/sign.js";
import { getProducts } from "./routes/products.js";
import { getProduct } from "./routes/product.js";
import { getCategories } from "./routes/categories.js";
import { postCart, getCart, putCart, deleteCart } from "./routes/cart.js";
import { postCheckout } from "./routes/checkout.js";
import { getSearchProducts } from "./routes/search.js";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-in", (req, res) => postSignIn(req, res));

app.post("/sign-up", (req, res) => postSignUp(req, res));

app.post("/sign-out", (req, res) => postSignOut(req, res));

app.get("/products", (req, res) => getProducts(req, res));

app.get("/product/:id", (req, res) => getProduct(req, res));

app.get("/categories", (req, res) => getCategories(req, res));

app.post("/cart", (req, res) => postCart(req, res));

app.get("/cart", (req, res) => getCart(req, res));

app.put("/cart", (req, res) => putCart(req, res));

app.delete("/cart", (req, res) => deleteCart(req, res));

app.post("/checkout", (req, res) => postCheckout(req, res));

app.get("/search", (req, res) => getSearchProducts(req, res));

export default app;
