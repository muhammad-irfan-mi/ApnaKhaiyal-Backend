const express = require('express');
const { handleSignUp, handleLogin, handleLogout, getToken } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/verifyToken.service');

const router = express.Router();

router.post('/signup', handleSignUp);
router.post('/login', handleLogin);
router.get('/token', getToken);
router.delete('/logout', verifyToken, handleLogout);


module.exports = router;