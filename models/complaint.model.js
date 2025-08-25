const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
        },
        userEmail: {
            type: String,
        },
        userRole: {
            type: String
        },
        complaintTitle: {
            type: String
        },
        complaintDesc: {
            type: String
        }
    },
    { timestamps: true }
)

const complaintModel = new mongoose.model('Complaint', complaintSchema)
module.exports = complaintModel