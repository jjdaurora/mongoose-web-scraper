var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var handlebars = require("express-handlebars")
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

mongoose.Promise = Promise;

var MONGODB_URI =
  process.env.MONGODB_URI ||("mongodb://localhost/mongoHeadlines",
  {
    useMongoClient: true
  });

// Routes

app.get("/scrape", function(req, res) {
  axios.get("http://www.theverge.com").then(function(response) {
    var $ = cheerio.load(response.data);
    $("h2.c-entry-box--compact__title").each(function(i, element) {
      var result = {};

      result.title = $(element).children("a").attr();

      result.author = $(element).children("a").attr();

      db.Headline.create(result)
        .then(function(dbHeadline) {
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          res.json(err);
        });
    });
  });
});

app.get("/headlines", function(req, res) {
  db.Headline.find({})
    .then(function(dbHeadline) {
      res.render("Headline", {
        title: res,
        author: res
      });
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  let id = req.params.id;

  db.Article.find({ _id: id })
    .then(function(dbHeadline) {
      res.json(dbHeadline);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbHeadline) {
      res.json(dbHeadline);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

// TODO -
// Comments
// Delete Comments
// Delete Articles
