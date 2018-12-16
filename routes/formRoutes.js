const bodyParser = require('body-parser')
const lodash = require('lodash')
const cors = require('cors')
const cuid = require('cuid')
const URL = require('url')
const { isEmpty } = lodash

module.exports = (app, db) => {	  
  app.use(cors());

  // store new form type and form instance altogether in DB
  app.post('/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const formInstanceId = cuid()
  	const data = { ...req.body, formId, formInstanceId }
  	let message = ''
  	const collection = db.collection(`form${formId}`)
  	const formCollection = db.collection('form')

  	formCollection.find({name: `form${formId}`}).toArray((err, data) => {
  		if (err) console.error(err)

  		if (data.length === 0) {
  			formCollection.insertOne({name: `form${formId}`}, (err, result) => {
		  		if (err) console.error(err)
		  		console.log('added new form = ', result.n)
		  	})
  		}
  	})

  	collection.insertOne(data, (err, result) => {
  		if (err) console.error(err)
  		console.log('inserted = ', result.insertedCount)
  		res.send({ 
  			message: 'success add form to DB',
  			data: { formInstanceId } 
  		})
  	})
  })

  // get all type of forms in DB
  app.get('/all-form', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // clear form collection in DB
  app.get('/clear-form', (req, res) => {
  	const formCollection = db.collection('form')

  	formCollection.deleteMany({}, (err, result) => {
  		if (err) console.error(err)
  		console.log('deleted = ', result)
  		res.send({ message: `success delete forms on DB` })
  	})
  })

  // get the record of form instance by form id & instanceId from DB
  app.get('/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const formInstanceId = url.query.instanceId
  	const collection = db.collection(`form${formId}`)

  	if (!isEmpty(formInstanceId)) {
	  	collection.find({ formInstanceId }).toArray((err, data) => {
	  		if (err) console.error(err)
	  		res.send({ data })
	  	})	
  	} else {
  		collection.find({}).toArray((err, data) => {
	  		if (err) console.error(err)
	  		res.send({ data })
	  	})
  	}
  })

  // delete a collection in DB
  app.get('/delete-collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.drop((err, result) => {
  		if (err) console.error(err)
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // get the all collections in DB
  app.get('/all-collection', (req, res) => {
  	db.listCollections().toArray((err, result) => {
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // find collection by name in DB
  app.get('/collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.find({}).toArray((err, result) => {
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })
}