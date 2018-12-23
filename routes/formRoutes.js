const bodyParser = require('body-parser')
const lodash = require('lodash')
const cors = require('cors')
const cuid = require('cuid')
const URL = require('url')
const { isEmpty } = lodash

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // store new form type and form instance altogether in DB
  app.post('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
    // TODO: change formInstanceId to recordId
  	const formInstanceId = cuid()
  	const data = { ...req.body, formId, formInstanceId }
  	let message = ''
  	const collection = db.collection(`form${formId}`)
  	const formCollection = db.collection('form')

  	// formCollection.find({name: `form${formId}`}).toArray((err, data) => {
  	// 	if (err) console.error(err)

  	// 	if (data.length === 0) {
  	// 		const form = {
  	// 			id: formId,
  	// 			name: `form${formId}`,
  	// 			route: `/collection?id=${formId}`,
  	// 			icon: 'format_list_bulleted',
  	// 			text: `Collection ${formId}`
  	// 		}

  	// 		formCollection.insertOne(form, (err, result) => {
		 //  		if (err) console.error(err)
		 //  		console.log('added new form = ', result.n)
		 //  	})
  	// 	}
  	// })

  	collection.insertOne(data, (err, result) => {
  		if (err) console.error(err)
  		console.log('inserted = ', result.insertedCount)
  		res.send({ 
        result: 1,
  			message: 'success add data',
  			data: { formInstanceId } 
  		})
  	})
  })

  // get the record of form instance by form id & instanceId from DB
  app.get('/api/record', (req, res) => {
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

  app.delete('/api/record', (req, res) => {
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const recordId = url.query.record_id
    const formCollection = db.collection(`form${formId}`)

    formCollection.deleteOne({formInstanceId: recordId}, (err, obj) => {
      if (err) console.error(err)

      if (obj.result.n > 0) {
        res.send({ message: `success delete record ${recordId}` })
      } else {
        res.send({ message: `failed to delete record ${recordId}` })
      }
    })
  })

  // check if collection name already exist in DB
  app.get('/api/check-collection-name', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const name = url.query.name.toLowerCase()
    const id = url.query.id

    formCollection.find({collectionName: name}).toArray((err, result) => {
      if (err) console.error(err)
      console.log('check result = ', result)
      if (result.length === 0) {
        res.send({ data: 0, message: 'not found' })
      } else {
        formCollection.findOne({id}, (err, form) => {
          if (err) console.error(err)
          console.log('form = ', form)
          if (form !== null) {
            res.send({ data: 1, currentName: form.collectionName, message: 'found' })
          } else {
            res.send({ data: 1, message: 'found' })
          }
        })
      }
    })
  })

  // create/update and save the new form to DB
  app.post('/api/create-form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
    let lastId
  	const formId = url.query.id
  	const formStructure = req.body.formStructure
    const collectionName = req.body.collectionName.toLowerCase()
    const tableColumns = req.body.tableColumns

  	formCollection.find({}).toArray((err, result) => {
      if (err) console.error(err)

      if (result.length > 0 ) lastId = result[result.length - 1].id

  		if (Number(formId) <= lastId && Number(formId) > 0) {
  			const form = {
  				id: formId,
  				name: `form${formId}`,
  				route: `/collection?id=${formId}`,
  				icon: 'format_list_bulleted',
  				collectionName,
  				formStructure,
          tableColumns
  			}

		  	formCollection.deleteOne({id: formId})
  			formCollection.insertOne(form, (err, obj) => {
		  		if (err) console.error(err)
		  		console.log('added new form = ', obj.result.n)

		  		res.send({ message: `${collectionName} schema updated`})
		  	})
  		} else {
        const newId = Number(lastId) + 1
  			const form = {
  				id: newId.toString(),
  				name: `form${newId}`,
  				route: `/collection?id=${newId}`,
  				icon: 'format_list_bulleted',
  				collectionName,
  				formStructure,
          tableColumns
  			}

  			formCollection.insertOne(form, (err, obj) => {
		  		if (err) console.error(err)
		  		console.log('added new form = ', obj.result.n)
		  	})

		  	res.send({ message: `${collectionName} schema created`})
  		}

  	}) 
  })

  // get form schema to be rendered in jsonschema-form
  app.get('/api/form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id

  	formCollection.findOne({id: formId}, (err, form) => {
  		console.log('found form = ', form)
  		if (form !== null) {
        if (form.formStructure !== null) {
  				res.send({
            formId: formId,
            column: form.tableColumns, 
            data: form.formStructure
          })
    		}
      }
  	})
  })

  // get all type of forms in DB
  app.get('/api/collection-list', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		console.log('result = ', result)
  		const data = result.map(r => {
  			return { 
  				id: r.id,
  				name: r.collectionName, 
  				urlDesigner: `/form-designer?id=${r.id}`,
  				urlForm: `/data-input?id=${r.id}` 
  			}
  		})
  		res.send({ data })
  	})
  })

  // get dynamic sidenav links based on created collection
  app.get('/api/sidenav-links', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		console.log('result = ', result)

  		const data = result.map(r => 
  			{
          // send Pascalcase collection name
          let { collectionName } = r
          collectionName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1)

          return { 
    				name: collectionName,
    				route: r.route,
    				icon: r.icon,
    				text: collectionName
    			}
        }
  		)
  		res.send({ data })
  	})
  })

  // delete a document in a collection
  app.delete('/api/delete-document', (req, res) => {
    const url = URL.parse(req.url, true)
    const doc = url.query.document
    const form = url.query.form
    const collection = db.collection(form)

    collection.deleteOne({collectionName: doc}, (err, obj) => {
      if (err) console.error(err)
      console.log('deleted = ', obj.result.n)
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
  		console.log('deleted = ', result)
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
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // get the all collections in DB
  app.get('/api/all-collection', (req, res) => {
  	db.listCollections().toArray((err, result) => {
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // find collection by name in DB
  app.get('/api/collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.find({}).toArray((err, result) => {
  		console.log('result = ', result)
  		res.send({ result })
  	})
  })
}