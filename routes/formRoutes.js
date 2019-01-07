const bodyParser = require('body-parser')
const request = require('request')
const lodash = require('lodash')
const cors = require('cors')
const cuid = require('cuid')
const URL = require('url')
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
    // TODO: change formInstanceId to recordId
    const formInstanceId = cuid()
    const data = { 
      ...req.body,
      formId, 
      formInstanceId,
      createdTime: new Date(), 
      createdBy: req.user._id
    }

  	collection.insertOne(data, (err, result) => {
  		if (err) console.error(err)
  		// console.log('inserted = ', result.insertedCount)
  		res.send({ 
        success: true,
  			message: 'success add data',
  			data: { formInstanceId } 
  		})
  	})
  })

  // update record in a form collection
  app.post('api/update-record', (req, res) => {
    const url = URL.parse(req.url, true)
    const formId = url.query.id
    const formInstanceId = url.query.instance_id
    const collection = db.collection(`form${formId}`)
    const updatedData = {
      ...req.body,
      modifiedTime: new Date(),
      modifiedBy: req.user._id
    }

    collection.updateOne({formInstanceId}, {$set: updatedData}, (err, obj) => {
      if (err) console.error(err)
      res.send({ message: `record ${formInstanceId} updated`})
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

  // delete record from a form collection
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
      // console.log('check result = ', result)
      if (result.length === 0) {
        res.send({ data: 0, message: 'not found' })
      } else {
        formCollection.findOne({id}, (err, form) => {
          if (err) console.error(err)
          // console.log('form = ', form)
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
  	const formId = url.query.id
  	const formStructure = req.body.formStructure
    const collectionName = req.body.collectionName.toLowerCase()
    const tableColumns = req.body.tableColumns

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
            tableColumns
    			}

          formCollection.updateOne({id: formId}, {$set: form}, (err, obj) => {
            if (err) console.error(err)
            // console.log('added new form = ', obj.result.n)
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
  		  		// console.log('added new form = ', obj.result.n)
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
          tableColumns
        }

        formCollection.insertOne(form, (err, obj) => {
          if (err) console.error(err)
          // console.log('added new form = ', obj.result.n)
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
    // TODO: need to cater for UIschema in DB also
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
  		// console.log('found form = ', form)
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
  		// console.log('result = ', result)
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
  		// console.log('result = ', result)

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

  // store sidenav links configuration to database
  app.post('/api/sidenav-links', (req, res) => {
    const sidenavCollection = db.collection('sidenav')
    const { appName, groupLinks } = req.body

    sidenavCollection.findOne({appName}, (err, config) => {
      if (err) console.error(err)
      if (config != null) {
        sidenavCollection.updateOne({appName}, {$set: { groupLinks }})
        res.send({ 
          message: 'updated existing sidenav config'
        })
      } else {
        sidenavCollection.insertOne(req.body, (err, result) => {
          if (err) console.error(err)
          // console.log('inserted = ', result.insertedCount)
          res.send({ 
            message: 'success add sidenav config'
          })
        })
      }
    })
  })

  // get sidenav config based on app name from DB
  app.get('/api/sidenav-config', (req, res) => {
    const url = URL.parse(req.url, true)
    const appName = url.query.app_name
    const sidenavCollection = db.collection('sidenav') 

    if (appName) {
      sidenavCollection.findOne({appName}, (err, sidenav) => {
        if (err) console.error(err)
        if (sidenav != null) {
          res.send({ data: sidenav })
        } else {
          res.send({ data: {}, message: `config for ${appName} is not found in database` })
        }
      })
    } else {
      sidenavCollection.find({}).toArray((err, result) => {
        if (err) console.error(err)

        if (result.length === 0) {
          res.send({ message: 'no sidenav config record in database'})
        } else if (result.length > 0) {
          res.send({ data: result })
        }
      })
    }

  })

  app.get('/api/external-content', (req, res) => {
    const authorization = {
      authorization: 'Bearer tSTsMNItVWUsFQJRJF2MtUsQ2K2O2FsIP2HtSVsLtUsP2EsItPsRPtR2etUsK2gtVUsJ2bsMtTsKtWsFtSsItWxqDsMIORRtTsNJtRsOtV'
    }

    request('https://app.taskngin.com/api/v1/tasks?from=2018-11-01', { headers: authorization }, (error, response, body) => {
      if (error) console.error(error)
      if (response.statusCode === 200) {
        res.send({ data: JSON.parse(body) })
      }
    })
  })

  app.patch('/api/external-content', (req, res) => {
    const url = URL.parse(req.url, true)
    const taskId = url.query.task_id
    const headers = {
      authorization: 'Bearer tSTsMNItVWUsFQJRJF2MtUsQ2K2O2FsIP2HtSVsLtUsP2EsItPsRPtR2etUsK2gtVUsJ2bsMtTsKtWsFtSsItWxqDsMIORRtTsNJtRsOtV'
    }

    const requestOptions = {
      method: 'PATCH', 
      uri: `https://app.taskngin.com/api/v1/tasks/${taskId}`, 
      body: JSON.stringify(req.body), 
      headers
    }

    request(requestOptions, (error, response, body) => {
        if (error) console.error(error)
        if (response.statusCode === 200) {
          let result
          try {
            result = JSON.parse(body)          
          } catch (err) {
            if (err) result = body
          }

          res.send({ result })
        } else {
          res.send({ result: 'request is not valid'})
        }
      }
    )

  })

  // ping the connection to open api url
  app.get('/api/ping-open-api', (req, res) => {
    const url = URL.parse(req.url, true)
    const openApiUrl = url.query.url

    request(openApiUrl, (error, response, body) => {
      if (error) {
        console.error(error)
        res.send({ success: false, message: 'URL error'})
      }

      if (response.statusCode >= 400) {
        res.send({ success: false, message: 'Fail to connect to URL'})
      } else if (response.statusCode === 200) {
        res.send({ success: true, message: 'Success connect to URL'})
      }
    })
  })

  // retrieve external open API first endpoint
  // then retrieve the parameters
  app.get('/api/retrieve-external-workflow-parameters', (req, res) => {
    const url = URL.parse(req.url, true)
    const openApiUrl = url.query.url

    request(openApiUrl, (error, response, body) => {
      if (error) console.error(error)
      
      const openApiData = JSON.parse(body)

      // extract the api url, http method, and parameters (in query and body)
      const firstPath = Object.keys(openApiData.paths)[0]
      const openApiTitle = openApiData.info.title
      const apiUrl = `https://${openApiData.host}${openApiData.basePath}${firstPath}`
      const apiMethod = Object.keys(openApiData.paths[firstPath])[0]
      const api = openApiData.paths[firstPath][apiMethod]
      const apiQuery = `?${api.parameters[1].name}=${api.parameters[1].default}`
      const apiCompleteUrl = apiUrl + apiQuery
      const apiBodySchema = api.parameters[0].schema.properties

      const apiBodyProperties = Object.keys(apiBodySchema).reduce((obj, key) => {
        return {
          ...obj, 
          [key] : Object.keys(apiBodySchema[key].properties).reduce((obj2, key2) => {
                    return { ...obj2, [key2] : '' }
                  }, {})
        }
      }, {})

      // adjust api parameters data to fit rendering purpose in frontend
      const apiParameters = Object.keys(apiBodyProperties).reduce((arr, key) => {
        return [
          ...arr, 
          { 
            name: key,
            properties: Object.keys(apiBodyProperties[key]).reduce((arr2, key2) => {
              return [
                ...arr2,
                {
                  name: key2,
                  type: apiBodySchema[key].properties[key2].type
                }
              ]
            }, []) 
          }
        ]
      }, [])

      res.send({ openApiTitle, apiBody: apiBodyProperties, apiParameters })
    })
  })

  // retrieve external open API first endpoint to be used
  // every time a document is saved/modified, then
  // save the API data to corresponding form collection
  app.post('/api/save-external-workflow', (req, res) => {
    const formCollection = db.collection('form')
    // TODO: handle start and modify action type differently
    const url = URL.parse(req.url, true)
    const actionType = url.query.action_type

    const { openApiTitle, openApiUrl, formId, apiBody } = req.body

    request(openApiUrl, (error, response, body) => {
      if (error) console.error(error)

      const openApiData = JSON.parse(body)

      // extract the api url, http method, and parameters (in query and body)
      const firstPath = Object.keys(openApiData.paths)[0]
      const apiUrl = `https://${openApiData.host}${openApiData.basePath}${firstPath}`
      const apiMethod = Object.keys(openApiData.paths[firstPath])[0]
      const api = openApiData.paths[firstPath][apiMethod]
      const apiQuery = `?${api.parameters[1].name}=${api.parameters[1].default}`
      const apiCompleteUrl = apiUrl + apiQuery
      const apiBodySchema = api.parameters[0].schema.properties

      // save parameters input from user inside api schema to DB
      const apiBodyProperties = Object.keys(apiBodySchema).reduce((obj, key) => {
        return {
          ...obj, 
          [key] : Object.keys(apiBodySchema[key].properties).reduce((obj2, key2) => {
                    return {...obj2, [key2] : apiBody[key][key2]}
                  }, {})
        }
      }, {})

      // adjust api parameters data to fit rendering purpose in frontend
      const apiParameters = Object.keys(apiBodyProperties).reduce((arr, key) => {
        return [
          ...arr, 
          { 
            name: key,
            properties: Object.keys(apiBodyProperties[key]).reduce((arr2, key2) => {
              return [
                ...arr2,
                {
                  name: key2,
                  type: apiBodySchema[key].properties[key2].type
                }
              ]
            }, []) 
          }
        ]
      }, [])

      let actionAPI = {}

      
      actionAPI = { 
        [`${actionType}ActionAPI`]: { 
          openApiTitle,
          openApiUrl,
          url: apiCompleteUrl, 
          method: apiMethod, 
          body: apiBodyProperties,
          parameters: apiParameters
        }
      }

      formCollection.updateOne({id: formId}, {$set: actionAPI}, (err, obj) => {
        if (err) console.error(err)
        res.send({ message: `API saved in form${formId} database`, [`${actionType}ActionAPI`]: actionAPI[`${actionType}ActionAPI`] })
      })
    })
  })

  // update the body contents of external api call
  app.post('/api/update-external-api-body', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const { body } = req.body

    formCollection.updateOne({id: formId}, {$set: {'actionAPI.body': body}}, (err, obj) => {
      if (err) console.error(err)
      res.send({ message: `API body saved in form${formId} database` })
    })
  })

  // call external api upon creating/updating a form document
  app.post('/api/call-events-api', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const actionType = url.query.action_type

    formCollection.findOne({id: formId}, (err, form) => {
      if (err) console.error(err)

      if (form != null) {
        if (form[`${actionType}ActionAPI`]) {
          const { url, method, body } = form[`${actionType}ActionAPI`]
          const formData = req.body
          
          const newBody = Object.keys(body).reduce((obj, parameter) => {
            return {
              ...obj,
              [parameter] : Object.keys(body[parameter]).reduce((obj2, property) => {
                // pattern to check double angle brackets string 
                // to be replaced by form input value
                const pattern = /^<<\w+>>$/
                const value = body[parameter][property]

                // if the value of the property is string with pattern: <<field_name>>
                // replace the pattern with form input value
                if (pattern.test(value)) {
                  const fieldName = value.slice(2, value.length - 2)

                  return {
                    ...obj2,
                    [property] : formData[fieldName]
                  }
                } else { // if the value is normal string use the value                  
                  return {
                    ...obj2, 
                    [property] : value
                  }
                }
              }, {})
            }
          }, {})

          const requestOptions = {
            method, 
            uri: url, 
            body: JSON.stringify(newBody)
          }
          
          request(requestOptions, (error, response, responseBody) => {
            if (error) console.error(error)
            res.send({ message: `${actionType} action API called`, data: responseBody })
          })
        } else {
          res.send({ message: `${actionType} action API not found in form${formId} database`})
        }
      } else {
        res.send({ message: `form${formId} not found in database`})
      }
    })
  })

  // save form table view config
  app.post('/api/save-table-view-config', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.form_id
    const { tableViewConfig, formFields } = req.body

    const tableColumns = formFields.reduce((arr, field) => {
      if (Object.keys(tableViewConfig).indexOf(field.fieldName) > -1 ) {
        return [
          ...arr,
          {
            fieldName: tableViewConfig[field.fieldName],
            showInTable: field.showInTable
          }
        ]
      }

      return [...arr, field]

    }, [])

    const updatedField = { 
      tableViewConfig,
      tableColumns
    }

    formCollection.updateOne(
      {id}, 
      {$set: updatedField}, 
      (err, obj) => {
        if (err) console.error(err)
        else {
          res.send({ message: `table view configuration for form ${formId} updated` })
        }
      }
    )
  })

  // retrieve form table view config
  app.get('/api/retrieve-table-view-config', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.form_id

    formCollection.findOne({id}, (err, result) => {
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

  // delete a document in a collection
  app.delete('/api/delete-document', (req, res) => {
    const url = URL.parse(req.url, true)
    const doc = url.query.document
    const form = url.query.form
    const collection = db.collection(form)

    collection.deleteOne({collectionName: doc}, (err, obj) => {
      if (err) console.error(err)
      // console.log('deleted = ', obj.result.n)
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
  		// console.log('deleted = ', result)
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
  		// console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // get the all collections in DB
  app.get('/api/all-collection', (req, res) => {
  	db.listCollections().toArray((err, result) => {
  		// console.log('result = ', result)
  		res.send({ result })
  	})
  })

  // find collection by name in DB
  app.get('/api/collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.find({}).toArray((err, result) => {
  		// console.log('result = ', result)
  		res.send({ result })
  	})
  })
}