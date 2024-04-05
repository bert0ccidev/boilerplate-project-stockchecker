'use strict';

const https = require('https');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res) {
      const symbol = req.query.stock;
      const like = req.query.like || false; // Default to false if 'like' parameter is not provided

      // Make a request to the external API
      const apiUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
      https.get(apiUrl, (apiRes) => {
        let data = '';
        
        // Accumulate data chunks
        apiRes.on('data', (chunk) => {
          data += chunk;
        });

        // Process response when it's complete
        apiRes.on('end', () => {
          try {
            const stockData = JSON.parse(data);

            // Construct the response object
            const responseData = {
              stockData: {
                stock: stockData.symbol,
                price: stockData.latestPrice,
                likes: like ? 1 : 0 // Convert 'like' parameter to number of likes (1 if true, 0 if false)
              }
            };

            // Send the response to the client-side JavaScript code
            res.json(responseData);
          } catch (error) {
            console.error("Error parsing stock data:", error);
            res.status(500).json({ error: "Failed to parse stock data" });
          }
        });
      }).on('error', (error) => {
        console.error("Error fetching stock data:", error);
        res.status(500).json({ error: "Failed to fetch stock data" });
      });
    });
};
