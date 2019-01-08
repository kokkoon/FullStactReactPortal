const express = require('express');
const mongoUtil = require( './services/mongoUtil' );
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');

const keys = require('./config/keys');

mongoUtil.connectToDB(err => {
  if (!err) console.log('Connected to MongoDB successfully')
  else console.log('Fail to connect to MongoDB\nError: ', err)
  
  // require('./services/passport');
  
  const app = express();

  app.use(bodyParser.json());
  app.use(
    cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000,
      keys: [keys.cookieKey]
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  require('./services/passport');

  require('./routes/authRoutes')(app);
  require('./routes/billingRoutes')(app);
  require('./routes/formRoutes')(app);
  require('./routes/sidenavRoutes')(app);
  require('./routes/externalCollectionRoutes')(app);
  require('./routes/eventApiRoutes')(app);
  require('./routes/mongodbUtilityRoutes')(app);

  if (process.env.NODE_ENV === 'production') {
    // Express will serve up production assets
    // like our main.js file, or main.css file!
    app.use(express.static('client/build'));

    // Express will serve up the index.html profile
    // if it doesn't recognize the route
    const path = require('path');
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  });
})


