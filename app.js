const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

app.use(bodyParser.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth middleware
app.use((req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, 'somesupersecretsecret');
    req.userId = decodedToken.userId;
    req.isAuth = true;
  } catch (err) {
    req.isAuth = false;
  }
  next();
});

// GraphQL endpoint
app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true,
}));

// Test routes (optional)
app.get('/protected', (req, res) => {
  if (!req.isAuth) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ message: 'You accessed a protected route', userId: req.userId });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start the server regardless of MongoDB connection
app.listen(8080, () => {
  console.log('Server running on port 8080');
  console.log('Swagger documentation available at http://localhost:8080/api-docs');
});

// Attempt to connect to MongoDB
mongoose
  .connect('mongodb+srv://mani:bIguvkQ6oyVrywjl@cluster0.9qpnjkp.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.log('MongoDB connection error. Please make sure MongoDB is running and your IP is whitelisted.');
    console.log(err);
  });