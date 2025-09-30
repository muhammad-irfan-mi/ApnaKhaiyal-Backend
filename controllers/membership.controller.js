const Membership = require("../models/membership.model");
const Plan = require("../models/Plan");
const UserModel = require("../models/user.model");
const { uploadFileToS3 } = require("../services/s3.service");
const crypto = require('crypto');


const PLAN_QUOTAS = {
    free: { listing: 100, feature: 20, top: 20 },
    medium: { listing: 700, feature: 50, top: 50 },
    premium: { listing: 2000, feature: 100, top: 100 }
};

function generatePlanKey(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%$#@!&*()-_+=";
    const bytes = crypto.randomBytes(length);
    let key = "";
    for (let i = 0; i < length; i++) {
        const idx = bytes[i] % chars.length;
        key += chars[idx];
    }
    return key;
}

const purchasePlan = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { plan, price, firstName, companyName, phone, email } = req.body || {};
        if (!["free", "medium", "premium"].includes(plan)) {
            return res.status(400).json({ message: "Invalid plan selected" });
        }
        if (price == null) {
            return res.status(400).json({ message: "Price is required" });
        }

        if (plan === "free" && user.isFreePlan) {
            return res.status(403).json({ message: "Free plan already claimed" });
        }

        let slipUrl = "";
        if (req.file) {
            slipUrl = await uploadFileToS3({
                fileBuffer: req.file.buffer,
                fileName: `plans/${user._id}_${Date.now()}.png`,
                mimeType: req.file.mimetype
            });
        }

        let planKey = generatePlanKey(12);
        let tries = 0;
        while (await Membership.findOne({ planKey })) {
            if (tries++ > 5) {
                planKey = generatePlanKey(16);
            } else {
                planKey = generatePlanKey(12);
            }
        }

        const membership = new Membership({
            userId: user._id,
            plan,
            price,
            firstName,
            companyName,
            phone,
            email,
            slipUrl,
            planKey,
            status: plan === "free" ? "approved" : "pending"
        });

        await membership.save();

        if (plan === "free") {
            user.isFreePlan = true;
        }

        user.listingQuota = PLAN_QUOTAS[plan].listing;
        user.featureQuota = PLAN_QUOTAS[plan].feature;
        user.topQuota = PLAN_QUOTAS[plan].top;

        user.planExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        await user.save();

        res.status(201).json({
            message: plan === "free"
                ? "Free plan activated successfully"
                : "Plan purchase request submitted, awaiting admin approval",
            membership
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const getAllMemberships = async (req, res) => {
    try {
        const memberships = await Membership.find()
            .populate("userId", "name email phoneNumber listingQuota isFreePlan")
            .sort({ createdAt: -1 });

        res.json({ memberships });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const getMembershipByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const membership = await Membership.find({ userId })
            .populate("userId", "name email phoneNumber listingQuota featureQuota topQuota isFreePlan")
            .sort({ createdAt: -1 });

        if (!membership) {
            return res.status(404).json({ message: "No membership found for this user" });
        }

        res.json({ membership });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const approveMembership = async (req, res) => {
    try {
        const { membershipId } = req.params;
        const membership = await Membership.findById(membershipId).populate("userId");
        if (!membership) return res.status(404).json({ message: "Membership not found" });

        if (membership.status === "approved") {
            return res.status(400).json({ message: "Already approved" });
        }

        // Fetch plan details from DB
        const plan = await Plan.findOne({ tier: membership.plan });
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const quota = PLAN_QUOTAS[membership.plan];

        membership.status = "approved";

        if (!membership.price) {
            membership.price = plan.price;
            membership.currency = plan.currency;
        }

        await membership.save();

        membership.userId.listingQuota += quota.listing;
        membership.userId.featureQuota += quota.feature;
        membership.userId.topQuota += quota.top;
        await membership.userId.save();

        res.json({ message: "Membership approved successfully", membership });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

module.exports = {
    purchasePlan,
    getAllMemberships,
    getMembershipByUser,
    approveMembership
};
