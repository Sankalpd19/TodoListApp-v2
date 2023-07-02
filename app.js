//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();

const _=require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sankalp:Sankalp2000@cluster0.flt191j.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema= {
  name:String
};
const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
})

const item2=new Item({
  name:"Hit the + button to add a new item."
})

const item3=new Item({
  name:"<-- Hit this to delete an item."
})

const defaultItems=[item1,item2,item3];

// Item.insertMany(defaultItems).then(function () {
//   console.log("Success");
// }).catch(function(error){
//   console.log(error)      // Failure
// });

async function findItem() {
  try{
    const doc= await Item.find();
    // console.log(doc);
    return doc;
  }
  catch(err){
    console.log(err);
  }
}
// findItem();
app.get("/", async function(req, res) {
    let items= await findItem();
    if(items.length===0)
    {
      Item.insertMany(defaultItems).then(function () {
        console.log("Success");
      }).catch(function(error){
        console.log(error)      // Failure
      });
      res.redirect("/");
    }else
    res.render("list", {listTitle: "Today", newListItems: items});
  
  });


app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  })

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    var foundListItem=await List.findOne({name:listName});
    foundListItem.items.push(item);
    foundListItem.save();
    res.redirect("/"+listName);
  }

});
app.post("/delete",async (req,res)=>{
  const deleteItem=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today")
  {
    await Item.findByIdAndRemove(deleteItem);
    res.redirect("/");
  }
  else
  {
      await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItem}}}).then(()=>{
        res.redirect("/"+listName);
      })
  }
 
  
})
app.get("/:customListName",async (req,res)=>{
  const customListName=_.capitalize(req.params.customListName);
  if(await List.findOne({name:customListName}))
  {
    let items=await List.findOne({name:customListName});
    // console.log(items[1].items);
    res.render("list",{listTitle:customListName,newListItems:items.items});
  }
  else{
     const list=new List({
    name:customListName,
    items:defaultItems
  });
  list.save();
  res.redirect("/"+customListName);
  // console.log("doesnt exists");
  }
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
