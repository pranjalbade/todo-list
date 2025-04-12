import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "postgres",
  port: 5432,
});

db.connect();

let items = [];

async function list_items(){
  const result = await db.query("SELECT * FROM items ORDER BY id ASC;");
  // result.rows.forEach(item => {
  //   items.push(item);
  // });
  items = result.rows;
  return items;
}

app.get("/", async (req, res) => {
  const items = await list_items();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try{
      await db.query(
        "INSERT INTO items (title) VALUES ($1);",
        [item]    
      );
      res.redirect("/"); 
  }catch(error){
    console.log(error);
    alert("Please enter something");
  }
});

app.post("/edit", async (req, res) => {
    const id = req.body.updatedItemId;
    const title = req.body.updatedItemTitle;
    await db.query("UPDATE items SET title = $1 WHERE id = $2;", [title, id]);
    res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1;", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
