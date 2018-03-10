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

mongoose.connect("mongodb://localhost/mongoHeadlines") ;

// Routes

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.author = $(this)
        .children("a")
        .attr("href");
      // Create a new Article using the `result` object built from scraping
      db.Headline.create(result)
        .then(function(dbHeadline) {

          Headline: {
            title: result
            author: result
          }
          // View the added result in the console
          console.log(dbHeadline);
        })
        // .catch(function(err) {
        //   // If an error occurred, send it to the client
        //   return res.json(err);
        // });
    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

app.get("/headlines", function(req, res) {
  db.Headline.find({})
    .then(function(data) {
      var headlineData = {
        Headline: data
      };
      res.render("saved", headlineData);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// app.get("/articles/:id", function(req, res) {
//   let id = req.params.id;

//   db.Article.find({ _id: id })
//     .then(function(dbHeadline) {
//       res.json(dbHeadline);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

// app.post("/articles/:id", function(req, res) {
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       return db.Article.findOneAndUpdate(
//         { _id: req.params.id },
//         { note: dbNote._id },
//         { new: true }
//       );
//     })
//     .then(function(dbHeadline) {
//       res.json(dbHeadline);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

// TODO -
// Comments
// Delete Comments
// Delete Articles
