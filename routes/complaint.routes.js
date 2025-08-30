const express = require('express')
const { handleAddComplaint, getAllComplaint } = require('../controllers/complaint.controller')
const router = express.Router()


router.post('/', handleAddComplaint)
router.get('/', getAllComplaint)


module.exports = router;