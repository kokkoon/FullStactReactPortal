// const { isEmpty } = require('lodash')
const cors = require('cors')
const URL = require('url')
const mongodb = require('mongodb')

const mongoUtil = require( '../services/mongoUtil' )
const db = mongoUtil.getDB()

module.exports = (app) => {	  
  app.use(cors());

  // get all users from collection
  app.get('/api/users', (req, res) => {
  	const collection = db.collection('users')

    collection.find({}).toArray((err, result) => {
      if (err) {
        res.statusCode(404).send()
      } else {
        res.send(result)
      }
    })
  })

  // check if app name existed in db
  app.get('/api/check-app-name', (req, res) => {
    const collection = db.collection('app')
    const url = URL.parse(req.url, true)
    const name = url.query.name
    const formId = url.query.form_id

    collection.findOne({ name }, (err, app) => {
      if (!err) {
        if (app == null) {
          res.send({ isAppNameOk: true })
        } else {
          res.send({ isAppNameOk: false })
        }
      }
    })
  })

  // store new app in db
  app.post('/api/create-app', (req, res) => {
    const collection = db.collection('app')
    const { appName } = req.body

    collection.updateOne({ name: appName }, { $set: req.body }, { upsert: true }, (err, result) => {
      if (err) {
        res.statusCode(404).send({ message: 'fail to create app' })
      } else {
        res.send({ message: 'app created' })
      }
    })
  })

  // get all apps from collection
  app.get('/api/apps', (req, res) => {
    const collection = db.collection('app')
    const user = req.user
    const query = { 
      $or: [
        { 'owner._id': user._id.toString() }, 
        { userList: { $elemMatch: { _id: user._id.toString() } } }
      ]
    }

    collection.find(query).toArray((err, result) => {
      if (err) {
        res.statusCode(404).send()
      } else {
        const apps = result.map(app => ({
          name: app.name,
          icon: app.icon,
          link: `/apps/${app.name}`
        }))

        res.send({ apps })
      }
    })
  })
}