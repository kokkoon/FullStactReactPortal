// WIP
const bodyParser = require('body-parser')
const lodash = require('lodash')
const cors = require('cors')
const cuid = require('cuid')
const URL = require('url')
const { isEmpty } = lodash

module.exports = (app, db) => {	  
  app.use(cors());

  app.post('/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const formInstanceId = cuid()
  	const data = { ...req.body, formId, formInstanceId }
  	let message = ''
  	const collection = db.collection(`form${formId}`)

  	collection.insertOne(data, (err, result) => {
  		if (err) console.error(err)
  		console.log('inserted = ', result.insertedCount)
  		res.send({ message: 'success add form to DB' })
  	})
  })

  // use /cleardb endpoint to clear modelModel in DB
  app.get('/cleardb', (req, res) => {
  	const collection = db.collection('form')

  	collection.deleteMany({}, (err, result) => {
  		if (err) console.error(err)
  		console.log('deleted = ', result.n)
  		res.send({ message: 'success delete form on DB' })
  	})
  })

  // get the record of form instance from DB
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
}

/*Mongoose implementation unsuccessful
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { Types, Schema } = mongoose
const cuid = require('cuid')
const lodash = require('lodash')
const { isEmpty } = lodash
const URL = require('url')

module.exports = (app) => {
  app.use(cors());

  var modelStore = {}
  const modelSchema = new Schema({ formId: String, schemaField: String })
  const modelModel = mongoose.model('model', modelSchema)
  let dataSchema = {}
  let dataModel = null

  app.post('/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const formInstanceId = cuid()
  	const data = { ...req.body, formId, formInstanceId }
  	let message = ''

  	let schemaTemp = {}
		for(let property in data) {
  		schemaTemp[property] = Schema.Types.Mixed
  	}

  	if (isEmpty(dataSchema)) dataSchema = new Schema(schemaTemp)
		dataModel = mongoose.model('form', dataSchema)
  	
		message = checkSaveFormModel(formId, modelModel, dataSchema, message)
		saveDataInstance(dataModel, data)
		
		findModel(modelModel, message)
			.then(result => {
				return res.send({
					message: result.message,
					result: result.entries ? result.entries : ''
				})
			})
			.catch(err => console.error(err))
  })

  // use /cleardb endpoint to clear modelModel in DB
  app.get('/cleardb', (req, res) => {
  	modelModel.remove({}, function(err) {
      if (err) return console.error(err)
      return console.log('collection removed')
    })

  	return res.send({
  		message: 'success clear modelModel in DB'
  	})
  })

  // get the record of form instance from DB
  app.get('/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const formInstanceId = url.query.instanceId

 		modelModel.findOne({ formId: formId }, (err, model) => {
			if (err) return console.error(err)
			console.log('model = ', model)
			if (model !== null) {
				const dataSchema = JSON.parse(model.schemaField)
				console.log('dataSchema = ', dataSchema)
				const dataModel = mongoose.model('form', dataSchema) 
				console.log('dataModel = ', dataModel)
				
				dataModel.find({ formId, formInstanceId }, (err, form) => {
					if (err) console.error(err)
					if (form.length > 0) {
						console.log('form = ', form)

						res.send({ form })
					}
				})
			}
		})
  })

  // check and save form schema that does not exist in DB
	checkSaveFormModel = (formId, modelModel, dataSchema, message) => {
		let newMessage = message

		modelModel.findOne({ formId: formId }, (err, model) => {
			if (err) return console.error(err)

			if (model === null) {
				const modelInstance = new modelModel({ formId: formId, schemaField: JSON.stringify(dataSchema) })
			  modelInstance.save((err, object) => {
			    if (err) return console.error(err)
			    newMessage += 'Success save to DB\n'
			  })
			} else {
				newMessage += 'Model already existed in DB\n'
			}
		})
		return newMessage
	}

	// save data instance to DB
	saveDataInstance = (dataModel, data) => {
		const dataInstance = new dataModel(data)
	  dataInstance.save((err, object) => {
	    if (err) return console.error(err)
	    console.log('saved to DB = ', object)
	  })
	}

	// find model in DB
	findModel = (searchModel, message) => {
		return new Promise(async (resolve, reject) => {
			let newMessage = message
			let temp = await searchModel.find((err, result) => {
				if (err) return console.error(err)
				
				if (result.length > 0) {
					newMessage += 'Model found in DB\n'
		  		return result
				} else {
					newMessage += 'Model not found in DB\n'
				}
	  	})
		  return resolve({ message: newMessage, entries: temp })
		})
	}
}*/
