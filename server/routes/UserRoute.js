const userController = require('../controllers/UserController');
const express = require('express');
const router = new express.Router();

const { usersURI } = require('../config/paths');

// Path is /api/users/login
// POST with correct email and password field
// will login and start session
router
  .route(usersURI.endpoints.login)
  .post(userController.login, userController.signJWTForUser);

// Path is /api/users/isLoggedIn
// POST will return status: true in JSON if logged in
router
  .route(usersURI.endpoints.isLoggedIn)
  .post(userController.optionalAuthentication, userController.isLoggedIn);

// Path is /api/users/list
// GET to list users
// Only user with role === 'Owner' can do this
/* 
  Accepts query parameters in this format
  categories=true // or false
  resources=true // or false
  locations=true // or false
  True will populate the array, false will leave it as an array of ObjectIDs.
*/
router
  .route(usersURI.endpoints.list)
  .get(userController.isAuthenticated, userController.list);

// Path is /api/users/:userId
// GET to read user by id
router
  .route('/:userId')
  .get(userController.isAuthenticated, userController.read);

// Path is /api/users/register
// POST
// Will create new user if current user has role === 'Owner'
router
  .route(usersURI.endpoints.register)
  .post(
    userController.optionalAuthentication,
    userController.register,
    userController.signJWTForUser
  );

// Path is /api/users/update/:userId
// POST
// Complete user editing control if current user has role === 'Owner'
// If no userId passed in then logged in user is updated
router
  .route(`${usersURI.endpoints.update}/:userId?`)
  .post(userController.isAuthenticated, userController.update);

// Path is /api/users/delete/:userId
// DELETE to delete user by id
router
  .route(`${usersURI.endpoints.delete}/:userId?`)
  .delete(userController.isAuthenticated, userController.delete);

// Middleware to get user by id from mongoDB
router.param('userId', userController.userById);

module.exports = router;
