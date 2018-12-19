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
  			const form = {
  				id: formId,
  				name: `form${formId}`,
  				route: `/collection?id=${formId}`,
  				icon: 'format_list_bulleted',
  				text: `Collection ${formId}`
  			}

  			formCollection.insertOne(form, (err, result) => {
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

  // create/update and save the new form to DB
  app.post('/create-form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	let counter = 0
  	const schema = req.body

  	formCollection.find({}).toArray((err, result) => {
  		counter = result.length
  		if (Number(formId) <= counter && Number(formId) > 0) {
  			const form = {
  				id: formId,
  				name: `form${formId}`,
  				route: `/collection?id=${formId}`,
  				icon: 'format_list_bulleted',
  				text: `Collection ${formId}`,
  				schema
  			}

		  	formCollection.deleteOne({id: formId})
  			formCollection.insertOne(form, (err, obj) => {
		  		if (err) console.error(err)
		  		console.log('added new form = ', obj.result.n)

		  		res.send({ message: `Form-${formId} schema updated`})
		  	})
  		} else {
  			const newId = counter + 1
  			const form = {
  				id: newId.toString(),
  				name: `form${newId}`,
  				route: `/collection?id=${newId}`,
  				icon: 'format_list_bulleted',
  				text: `Collection ${newId}`,
  				schema
  			}

  			formCollection.insertOne(form, (err, obj) => {
		  		if (err) console.error(err)
		  		console.log('added new form = ', obj.result.n)
		  	})

		  	res.send({ message: `New Form-${newId} schema created`})
  		}

  	}) 
  })

  // get form schema to be rendered in jsonschema-form
  app.get('/form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id

  	formCollection.findOne({id: formId}, (err, form) => {
  		console.log('found form = ', form)
  		if (form.schema !== null) {
				res.send({ data: form.schema })
  		}
  	})
  })

  // get all type of forms in DB
  app.get('/collection-list', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		console.log('result = ', result)
  		const data = result.map(r => {
  			return { 
  				id: r.id,
  				name: r.name, 
  				urlDesigner: `/form-designer?id=${r.id}`,
  				urlForm: `/data-input?id=${r.id}` 
  			}
  		})
  		res.send({ data })
  	})
  })

  app.get('/sidenav-links', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		console.log('result = ', result)
  		const data = result.map(r => 
  			({ 
  				name: r.name,
  				route: r.route,
  				icon: r.icon,
  				text: r.text
  			})
  		)
  		res.send({ data })
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