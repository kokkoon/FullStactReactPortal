const cors = require('cors')
const URL = require('url')

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // delete a document in a collection
  app.delete('/api/delete-document', (req, res) => {
    const url = URL.parse(req.url, true)
    const { value, form, field} = url.query
    const collection = db.collection(form)
    const data = { [field] : value }

    collection.deleteOne(data, (err, obj) => {
      if (err) console.error(err)
      if (obj.result.n > 0) {
        res.send({ message: `success delete document with ${field} = ${value} from ${form} collection` })
      } else {
        res.send({ message: `no document with ${field} = ${value} in ${form} collection` })
      }
    })
  })

  // clear collection
  app.get('/api/delete-all-documents', (req, res) => {
    const url = URL.parse(req.url, true)
    const { form } = url.query
  	const formCollection = db.collection(form)

  	formCollection.deleteMany({}, (err, result) => {
  		if (err) console.error(err)
  		res.send({ message: `success delete forms on DB` })
  	})
  })

  // delete collection
  app.get('/api/delete-collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.drop((err, result) => {
  		if (err) console.error(err)
  		res.send({ result })
  	})
  })

  // get the all collections
  app.get('/api/all-collection', (req, res) => {
  	db.listCollections().toArray((err, result) => {
  		res.send({ result })
  	})
  })

  // find collection by name
  app.get('/api/collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.find({}).toArray((err, result) => {
  		res.send({ result })
  	})
  })
}