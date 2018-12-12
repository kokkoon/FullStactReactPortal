// WIP

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
  const modelSchema = new Schema({ id: String, schemaField: Schema.Types.Mixed, modelField: Schema.Types.Mixed })
  const modelModel = mongoose.model('model', modelSchema)

  app.post('/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	formId = url.query.id
  	const formInstanceId = cuid()
  	const data = { ...req.body, formId } 

  	let schemaTemp = {}
		for(let property in data) {
  		schemaTemp[property] = Schema.Types.Mixed
  	}
		const dataSchema = new Schema(schemaTemp)
		const dataModel = mongoose.model('form', dataSchema)

		// storing model and schema to DB
		modelModel.findOne({ id: formId}, (err, resModel) => {
			if (err) return console.error(err)
			if (resModel == null) {
				const modelInstance = new modelModel({ id: formId, schemaField: dataSchema, modelField: dataModel })
			  modelInstance.save((err, object) => {
			    if (err) return console.error(err)
			  	console.log('object = ', object)
			  	console.log('success to save to DB ', object)

			  	modelModel.find((err, result) => {
			  		console.log('Model that are stored in DB = \n', result)

			  		res.send({
				      message: 'get your message',
				      data: result
				    })
			  	})
			  })
			}
		})  	
  })

  app.get('/record', (req, res) => {
    // modelStore['document'].find(function (err, entries) {
    //   if (err) console.error(err)

    //   res.send({
    //     message: 'data found on DB',
    //     data: entries,
    //   })
    // })
  })
}