const express = require('express');
const { createPlan, getPlans, getPlanById, updatePlan, deletePlan } = require('../controllers/Plan.controller.js');
const router = express.Router();




router.post('/', createPlan)
router.get('/all-plan', getPlans)
router.get('/:id', getPlanById)
router.patch('/:id', updatePlan)
router.delete('/:id', deletePlan)


module.exports = router