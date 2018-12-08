const cors = require('cors');
const bodyParser = require('body-parser');

module.exports = (app) => {
  app.use(cors());

  // <--------- FUNCTION TO CREATE DYNAMIC ROUTE -------------------->
  
  // const collection = [
  //   { method: 'post',
  //     route: '/create/collection' },
  //   { method: 'get',
  //     route: '/fetch/collection' },
  // ]

  let collection = [];
  
  for (let i=0; i < collection.length; i++) {
    if (collection[i].method === 'post') {
      app.post(collection[i].route, (req, res) => {
        res.send({
          message: 'success',
          data: req.body,
        })
      });
    } 
    else if (collection[i].method === 'get') {
      app.get(collection[i].route, (req, res) => {
        res.send({
          message: 'success',
        })
      });
    }
  }

  app.post('/create/collection',
    (req, res) => {
      const data = req.body;

      collection.push({
        name: data.schemaName,
        method: data.field1,
        route: data.field2,
      });

      res.send({
        message: 'success',
        data: req.body,
      });
    }
  );
};