const express = require('express')
const { handleAddComplaint } = require('../controllers/complaint.controller')
const router = express.Router()


router.post('/', handleAddComplaint)


module.exports = router;