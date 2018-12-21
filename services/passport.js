const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoUtil = require('./mongoUtil')
const keys = require('../config/keys')

const User = mongoUtil.getDB().collection('users')

passport.serializeUser((user, done) => {
  done(null, user.googleId)
})

passport.deserializeUser((googleId, done) => {
  User.findOne({ googleId }, (err, user) => {
    done(err, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) console.error(err)

        if (user) return done(null, user)
        else {
          User.insertOne({ googleId: profile.id, credits: 0 }, (err, obj) => {
            if (obj.result.ok) done(null, obj.ops[0])
          })
        }
      })
    }
  )
)
