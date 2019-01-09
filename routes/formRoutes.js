const lodash = require('lodash')
const cors = require('cors')
const URL = require('url')
const mongodb = require('mongodb')
const { isEmpty } = lodash

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // save new record in a form colletion
  app.post('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const collection = db.collection(`form${formId}`)
    const data = { formId, ...req.body }

  	collection.insertOne(data, (err, result) => {
  		if (err) console.error(err)
  		res.send({ 
        success: true,
  			message: 'success add data'
  		})
  	})
  })

  // update record in a form collection
  app.post('api/update-record', (req, res) => {
    const url = URL.parse(req.url, true)
    const formId = url.query.id
    const recordId = url.query.record_id
    const collection = db.collection(`form${formId}`)
    const updatedData = { ...req.body }

    collection.updateOne({_id: recordId}, {$set: updatedData}, (err, obj) => {
      if (err) console.error(err)
      res.send({ message: `record ${recordId} updated`})
    })
  })

  // get the record of form instance by form id & instanceId from DB
  app.get('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
    const recordId = url.query.record_id
  	const collection = db.collection(`form${formId}`)

  	if (!isEmpty(recordId)) {
	  	collection.find({ _id: recordId }).toArray((err, data) => {
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

  // delete record from a form collection
  app.delete('/api/record', (req, res) => {
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const recordId = url.query.record_id
    const formCollection = db.collection(`form${formId}`)

    formCollection.deleteOne({ _id: new mongodb.ObjectId(recordId) }, (err, obj) => {
      if (err) console.error(err)

      if (obj.result.n > 0) {
        res.send({ message: `success delete record ${recordId}` })
      } else {
        res.send({ message: `failed to delete record ${recordId}` })
      }
    })
  })

  // check if collection name already exist in database
  app.get('/api/check-collection-name', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const name = url.query.name.toLowerCase()
    const id = url.query.id

    formCollection.find({collectionName: name}).toArray((err, result) => {
      if (err) console.error(err)
      if (result.length === 0) {
        res.send({ isFound: false, message: 'not found' })
      } else {
        formCollection.findOne({id}, (err, form) => {
          if (err) console.error(err)
          if (form !== null) {
            res.send({ isFound: true, currentName: form.collectionName, message: 'found' })
          } else {
            res.send({ isFound: true, message: 'found' })
          }
        })
      }
    })
  })

  // create/update and save the new form to database
  app.post('/api/create-form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const { formStructure, tableColumns, formFields } = req.body
    const collectionName = req.body.collectionName.toLowerCase()

    const tableViewConfig = formFields.reduce((obj, field, index) => {
      return {
        ...obj,
        [field.fieldName] : {
          displayName: field.fieldName,
          order: index + 1,
          showInTable: field.showInTable
        }
      }
    }, {})

  	formCollection.find({}).toArray((err, result) => {
      if (err) console.error(err)

      if (result.length > 0 ) {
        const resultIds = result.map(r => r.id).sort((a, b) => a - b)
        const lastId = resultIds[resultIds.length - 1]

    		if (Number(formId) <= lastId && Number(formId) > 0) {
    			const form = {
    				id: formId,
    				name: `form${formId}`,
    				route: `/collection?id=${formId}`,
    				icon: 'format_list_bulleted',
    				collectionName,
    				formStructure,
            tableColumns,
            tableViewConfig
    			}

          formCollection.updateOne({id: formId}, {$set: form}, (err, obj) => {
            if (err) console.error(err)
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
            tableColumns,
            tableViewConfig
    			}

    			formCollection.insertOne(form, (err, obj) => {
  		  		if (err) console.error(err)
  		  	})

  		  	res.send({ message: `${collectionName} schema created`})
    		}
      } else {
        const newId = 1
        const form = {
          id: newId.toString(),
          name: `form${newId}`,
          route: `/collection?id=${newId}`,
          icon: 'format_list_bulleted',
          collectionName,
          formStructure,
          tableColumns,
          tableViewConfig
        }

        formCollection.insertOne(form, (err, obj) => {
          if (err) console.error(err)
        })

        res.send({ message: `${collectionName} schema created`})
      }

  	}) 
  })

  app.patch('/api/update-form-schema', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.id
    const schema = req.body
    
    const updateFields = {
      $set: { 
        formStructure: schema.JSON,
        uiSchema: schema.UI
      }
    }

    formCollection.updateOne({id}, updateFields, (err, obj) => {
      if (err) console.error(err)
        
      if (obj.result.n === 1) {
        res.send({ message: 'schema updated'})
      } else {
        res.send({ message: 'fail to update schema'})
      }
    })
  })

  // get form schema to be rendered in jsonschema-form
  app.get('/api/form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id

  	formCollection.findOne({id: formId}, (err, form) => {
  		if (form !== null) {
        if (form.formStructure !== null) {
  				res.send({
            formId: formId,
            collectionName: form.collectionName,
            column: form.tableColumns, 
            data: form.formStructure,
            createdActionAPI: form.createdActionAPI,
            modifiedActionAPI: form.modifiedActionAPI
          })
    		}
      }
  	})
  })

  // get all type of forms in DB
  app.get('/api/collection-list', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
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
}