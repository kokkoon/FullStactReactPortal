const lodash = require('lodash')
const cors = require('cors')
const URL = require('url')
const mongodb = require('mongodb')
const { isEmpty } = lodash

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // save record in a form colletion
  app.post('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const collection = db.collection(`${formId}`)
    const newDate = new Date().toISOString()
    const userId = req.user._id

    const data = { 
      formId, 
      createdTime: newDate,
      createdBy: userId,
      modifiedTime: newDate,
      modifiedBy: userId,
      ...req.body 
    }

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
    const collection = db.collection(`${formId}`)
    const newDate = new Date().toISOString()
    const userId = req.user._id

    const updatedData = { 
      ...req.body,
      modifiedTime: newDate,
      modifiedBy: userId,
    }

    collection.updateOne({_id: mongodb.ObjectID(recordId)}, {$set: updatedData}, (err, obj) => {
      if (err) console.error(err)
      res.send({ message: `record ${recordId} updated`})
    })
  })

  // get the record of form instance by form id & instanceId from DB
  app.get('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
    const recordId = url.query.record_id
  	const collection = db.collection(`${formId}`)

  	if (!isEmpty(recordId)) {
	  	collection.find({ _id: mongodb.ObjectID(recordId) }).toArray((err, data) => {
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
    const collection = db.collection(`${formId}`)

    collection.deleteOne({ _id: mongodb.ObjectId(recordId) }, (err, obj) => {
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
        formCollection.findOne({_id: mongodb.ObjectID(id)}, (err, form) => {
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

  // create/update and save the form to database
  app.post('/api/create-form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const { formStructure, tableColumns, formFields, defaultFields } = req.body
    const collectionName = req.body.collectionName.toLowerCase()
    const { collectionDescription } = req.body

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

    const formData = {
      icon: 'format_list_bulleted',
      collectionName,
      collectionDescription,
      formFields,
      formStructure,
      tableColumns,
      tableViewConfig
    }

  	formCollection.find({}).toArray((err, result) => {
      if (err) console.error(err)
      if (formId === 'new' || result.length < 0) {
        formCollection.insertOne(formData, (err2, obj2) => {
          if (err) console.error(err)
          else {
            const unique_id = obj2.ops[0]._id
            const updatedFields = {name: `${unique_id}`, route: `/collection?id=${unique_id}`}
            formCollection.updateOne({_id: mongodb.ObjectID(unique_id)}, {$set: updatedFields})
          }
        })
        res.send({ message: `${collectionName} schema created`})
      } else if (result.length > 0 ) {
    		formCollection.findOne({_id: mongodb.ObjectID(formId)}, (err2, result2) => {
          if (result2 != null) {
            formCollection.updateOne({_id: mongodb.ObjectID(formId)}, {$set: formData}, (err3, obj3) => {
              if (!err3) res.send({ message: `${collectionName} schema updated`})
            })
      		} else {
      			formCollection.insertOne(formData, (err3, obj3) => {
    		  		if (err3) console.error(err3)
              const unique_id = obj3.ops[0]._id
              const updatedFields = {name: `${unique_id}`, route: `/collection?id=${unique_id}`}
              formCollection.updateOne({_id: mongodb.ObjectID(unique_id)}, {$set: updatedFields})
    		  	})

    		  	res.send({ message: `${collectionName} schema created` })
      		}
        })
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

    formCollection.updateOne({_id: mongodb.ObjectID(id)}, updateFields, (err, obj) => {
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

  	formCollection.findOne({_id: mongodb.ObjectID(formId)}, (err, form) => {
  		if (form !== null) {
        if (form.formStructure !== null) {
  				res.send({
            formId: form._id,
            collectionId: form._id,
            collectionName: form.name,
            collectionDisplayName: form.collectionName,
            collectionDescription: form.collectionDescription,
            formFields: form.formFields,
            column: form.tableColumns, 
            data: form.formStructure,
            uiSchema: form.uiSchema,
            createdActionAPI: form.createdActionAPI,
            modifiedActionAPI: form.modifiedActionAPI
          })
    		} else {
          res.send({ message: 'form structure not found'})
        }
      } else {
        res.send({ message: 'form not found'})
      }
  	})
  })

  // get all type of forms in DB
  app.get('/api/collection-list', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		const data = result.map(r => {
  			return { 
  				id: r._id,
  				name: r.collectionName, 
  				urlDesigner: `/form-designer?id=${r._id}`,
  				urlForm: `/data-input?id=${r._id}` 
  			}
  		})
  		res.send({ data })
  	})
  })

  // save form table view config
  app.post('/api/save-table-view-config', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.form_id
    const { tableViewConfig, formFields } = req.body

    const newFormFields = formFields.map(field => {
      return { ...field, showInTable: tableViewConfig[field.fieldName].showInTable }
    })

    const updatedField = { 
      tableViewConfig,
      formFields: newFormFields
    }

    formCollection.updateOne(
      {_id: mongodb.ObjectID(id)}, 
      {$set: updatedField}, 
      (err, obj) => {
        if (err) console.error(err)
        else {
          res.send({ message: `table view configuration for form-${id} updated` })
        }
      }
    )
  })

  // retrieve form table view config
  app.get('/api/retrieve-table-view-config', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.form_id

    formCollection.findOne({_id: mongodb.ObjectID(id)}, (err, result) => {
      if (err) console.error(err)
      else if (result != null) {
        if (result.tableViewConfig) {
          res.send({ 
            message: `table view configuration form ${id} found`,
            data: result.tableViewConfig
          })
        } else {
          res.send({ message: `table view configuration not found in form ${id}` })
        }
      } else {
        res.send({ message: `form ${id} not found` })
      }
    })
  })
}