//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-vithujan:Vithujan19%23@cluster0-1wyka.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });
const todolistSchema = {
  name:String
};

const Todolist = mongoose.model("Todolist", todolistSchema);

const item1 = new Todolist({
  name:"Welcome to the TodoList"
});
const item2 = new Todolist({
  name:"Hit + for add new items"
});
const item3 = new Todolist({
  name:"--Hit for Delete some items"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  todolists:[todolistSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
Todolist.find({}, function(err, foundTodolists){
if(foundTodolists.length === 0){
  Todolist.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Items Updated successfully...");
    }
  });
  res.redirect("/");
}else{
  res.render("list", {listTitle: "Today", newListItems: foundTodolists});
}
});
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundLists){
      if(!err){
        if(!foundLists){
          //create a new list...
          const list = new List({
            name: customListName,
            todolists: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }else{
          //Show an existing list
          res.render("list", {listTitle: foundLists.name, newListItems: foundLists.todolists});
        }
      }
  });



});
app.post("/", function(req, res){

  const todolistName = req.body.newItem;
  const listName = req.body.list;

  const todolist = new Todolist({
    name: todolistName
  });

  if(listName === "Today"){
    todolist.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundLists){
      foundLists.todolists.push(todolist);
      foundLists.save();
      res.redirect("/"+listName);
    });
  }



});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Todolist.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("successfully deleted Checked items");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{todolists:{_id:checkedItemId}}}, function(err, foundLists){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});



app.get("/about", function(req, res){
  res.render("about");
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfully");
});
