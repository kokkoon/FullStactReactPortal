const cors = require('cors')
const URL = require('url')

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // delete a document in a collection
  app.delete('/api/delete-document', (req, res) => {
    const url = URL.parse(req.url, true)
    const doc = url.query.document
    const form = url.query.form
    const collection = db.collection(form)

    collection.deleteOne({collectionName: doc}, (err, obj) => {
      if (err) console.error(err)
      if (obj.result.n > 0) {
        res.send({ message: `success delete document ${doc} from ${form} collection` })
      } else {
        res.send({ message: `no document ${doc} in ${form} collection` })
      }
    })
  })

  // clear form collection in DB
  app.get('/api/clear-form', (req, res) => {
  	const formCollection = db.collection('form')

  	formCollection.deleteMany({}, (err, result) => {
  		if (err) console.error(err)
  		res.send({ message: `success delete forms on DB` })
  	})
  })

  // delete a collection in DB
  app.get('/api/delete-collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.drop((err, result) => {
  		if (err) console.error(err)
  		res.send({ result })
  	})
  })

  // get the all collections in DB
  app.get('/api/all-collection', (req, res) => {
  	db.listCollections().toArray((err, result) => {
  		res.send({ result })
  	})
  })

  // find collection by name in DB
  app.get('/api/collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.find({}).toArray((err, result) => {
  		res.send({ result })
  	})
  })
}