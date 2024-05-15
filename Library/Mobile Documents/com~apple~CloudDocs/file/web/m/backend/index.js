const express = require('express');
const session = require('express-session');
const passport = require('passport');



require('./auth');

const app = express();

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});


//Server generates unique secret key for user:
const secretKey = crypto.randomBytes(160)
await addSecretKeyForUser(username, secretKey)
//Give secret key to user via QR code...
//Generate the current one-time password
const counter = Math.floor(Date.now() / (30 * 1000))
const hmacHash = crypto.createHmac('sha1',
secretKey).update(counter).digest()
const offset = hmacHash[19] & 0xf
const truncatedHash = ((hmacHash[offset++] & 0x7f) << 24 |
(hmacHash[offset++] & 0xff) << 16 |
(hmacHash[offset++] & 0xff) << 8 |
(hmacHash[offset++] & 0xff) )
const finalOTP = truncatedHash % (10 ^ 6)

app.listen(5000, () => console.log('listening on port: 5000'));
