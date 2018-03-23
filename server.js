var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var handlebars = require("express-handlebars")
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("."));

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});
// Routes
// get routes
app.get("/getheadlines", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.theverge.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $("h2.c-entry-box--compact__title").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element)
        .children()
        .text();

      result.author = $(element)
        .children()
        .attr("href");

      //Create a new Article using the `result` object built from scraping
      db.Headline.create(result).then(function(dbHeadline) {
        Headline: {
          title: result.title
          author: result.author
          saved: false
        }
        // View the added result in the console
        console.log(dbHeadline);
      });
    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    db.Headline.find({}, {}, { sort: { '_id' : -1 } }) 
      .then(function(data) {
        var headlineData = { Headline: data };
        console.log(headlineData);
        res.render("home", headlineData);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
});

app.get("/", function(req, res) {
    db.Headline.find({}, {}, { sort: { _id: -1 } })
      .then(function(data) {
        var headlineData = { Headline: data };
        res.render("home", headlineData);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.get("/saved", function(req, res) {
  let id = req.params.id;

  db.Headline.find({ saved: true })
    .then(function(dbHeadline) {
      res.render("saved", { Headline: dbHeadline});
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {
  let id = req.params.id;

  db.Note.find({})
    .then(function(dbNote) {
      res.render("notes", { Note: dbNote });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// post routes
app.post("/saved/:id", function(req, res) {
    db.Headline.findOneAndUpdate(
        { _id: req.params.id },
        {$set:{saved: true}}
      )
    .then(function(dbHeadline) {
      res.json(dbHeadline);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/delete/:id", function(req, res) {
  db.Headline.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { saved: false } }
  )
    .then(function(dbHeadline) {
      window.location.href("/saved");
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
