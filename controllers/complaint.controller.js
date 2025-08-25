const complaintModel = require("../models/complaint.model");


const handleAddComplaint = async (req, res) => {
    const { userName, userEmail, userRole, complaintTitle, complaintDesc } = req.body;

    try {
        if (!userEmail || !complaintTitle || !complaintDesc) {
            return res.status(400).josn({ msg: "Please required Email Complain Title and Descrition" })
        }

        const complainData = {
            userName,
            userEmail,
            userRole,
            complaintTitle,
            complaintDesc
        }

        const newComplain = new complaintModel(complainData)
        const complain = await newComplain.save()

        res.status(201).json({
            msg: "Complain added Successfully", complain
        });
    }
    catch (error) {
        console.log(error)
        res.send({ status: "Something went wrong" })
    }

}


module.exports = {
    handleAddComplaint
}