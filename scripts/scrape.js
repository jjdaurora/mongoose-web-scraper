let cheerio = require("cheerio");
let request = require("request");
let axios = require("axios");
let results = [];

let axiosScrape = function(callback) {
  console.log(
    "\n******************************************\n" +
      "Grabbing every article headline and link\n" +
      "from the The Verge:" +
      "\n******************************************\n"
  );
  results = [];
  axios
    .get("https://www.npr.org/sections/technology/")
    .then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);
      // Empty array to save our scraped data

      // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
      $("article.item").each(function(i, element) {
        // Save the text of the h4-tag as "title"
        let title = $(element)
          .find("h2")
          .find("a")
          .text();
        let link = $(element)
          .find("h2")
          .find("a")
          .attr("href");
        let date = $(element)
          .find(".teaser")
          .find("time")
          .find(".date")
          .text()
          .split("•")[0]
          .trim();
        let teaser = $(element)
          .find(".teaser")
          .find("a")
          .text()
          .split("•")[1]
          .trim();

        // Make an object with data we scraped for this h4 and push it to the results array
        results.push({
          title: title,
          link: link,
          date: date,
          teaser: teaser
        });
      });
      // console.log(results)
      callback(null, results);
    });
};

module.exports = {
  axiosScrape: axiosScrape
};
