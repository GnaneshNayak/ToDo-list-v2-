//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-gnanesh:7WsXKAJTuCkasJaM@cluster0.jrhaejb.mongodb.net/myfirstdbs",
  () => console.log("connected to mongodb")
);
/// item schema
const itemschema = {
  name: String,
};

////mode
const Items = mongoose.model("Item", itemschema);

const item1 = new Items({
  name: "Buy Vegies",
});

const item2 = new Items({
  name: "Cook Vegies",
});

const item3 = new Items({
  name: "Eat Vegies",
});

const defualtItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemschema],
};

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
  Items.find({}, (err, result) => {
    if (result.length === 0) {
      Items.insertMany(defualtItems, (err) => {
        if (err) console.log(" err in insert");
        else console.log("Inserted derfulItems");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

app.get("/:name", (req, res) => {
  const customListName = _.capitalize(req.params.name);
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defualtItems,
        });
        list.save();

        console.log("doesnt exsits creating new one");
        res.redirect("/" + customListName);
      } else {
        console.log("alredy exsits");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Items({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Items.findByIdAndRemove(checkedItemId, (err) => {
      if (err) console.log("err in deleting checked item ");
      else {
        console.log("successfull dellted checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
