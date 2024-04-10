const https = require('https');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stocks = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];
      const likes = req.query.like || false; // Default to false if 'like' parameter is not provided

      let stockData = [];

      // Make requests to the external API for each stock
      const promises = stocks.map(stock => {
        const apiUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
        return new Promise((resolve, reject) => {
          https.get(apiUrl, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
              data += chunk;
            });

            apiRes.on('end', () => {
              try {
                const stockInfo = JSON.parse(data);
                const stockObj = {
                  stock: stockInfo.symbol,
                  price: stockInfo.latestPrice,
                  likes: likes ? 1 : 0 // Convert 'like' parameter to number of likes (1 if true, 0 if false)
                };
                stockData.push(stockObj);
                resolve();
              } catch (error) {
                console.error("Error parsing stock data:", error);
                reject(error);
              }
            });
          }).on('error', (error) => {
            console.error("Error fetching stock data:", error);
            reject(error);
          });
        });
      });

      // Once all requests are complete, send the response to the client-side JavaScript code
      Promise.all(promises)
        .then(() => {
          // If only one stock requested, send single object, otherwise send array of objects
          if (stockData.length === 1) {
            res.json({ stockData: stockData[0] });
          } else {
            res.json({ stockData: stockData });
          }
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to fetch stock data" });
        });
    });
};
