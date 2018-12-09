const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;

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

  var modelStore = {};

  function createSchema(name, field, type, value, modelStore, res) {
    const newModelStore = modelStore;

    if (!(name in newModelStore)) {
        let schemaTemp = {};
        schemaTemp[field] = type;

        const schema = new Schema(schemaTemp);
        newModelStore[name] = mongoose.model(name, schema);
    }

    let objectTemplate = {};
    objectTemplate[field] = value;
    const object = new newModelStore[name](objectTemplate);

    object.save(function (err, object) {
      if (err) return console.error(err);

      console.log('new data saved to DB');

      newModelStore[name].find(function (err, entries) {
        if (err) console.error(err);
        console.log('found data on DB');
        console.log('entries = \n', entries);

        res.send({
          message: 'new data saved to DB',
          data: entries,
        })
      });

    });

    return newModelStore;
  }

  app.post('/create/collection',
    (req, res) => {
      const data = req.body;

      collection.push({
        name: data.schemaName,
        method: data.field1,
        route: data.field2,
      });

      modelStore = createSchema(data.schemaName, data.field, data.type, data.value, modelStore, res);
      console.log('modelStore = ', modelStore)

      // res.send({
      //   message: 'success',
      //   data: req.body,
      // });
    }
  );
};