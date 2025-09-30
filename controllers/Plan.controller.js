const Plan = require("../models/Plan");

const createPlan = async (req, res) => {
    try {
        const {
            tier,
            price,
            currency,
            features = [],
            description = '',
            isListing = 0,
            featureQuota = 0,
            topQuota = 0
        } = req.body;

        const missingFields = [];
        if (!tier) missingFields.push("tier");
        if (price === undefined || price === null) missingFields.push("price");
        if (!currency) missingFields.push("currency");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                missingFields
            });
        }

        // Prevent duplicate tier
        const existingPlan = await Plan.findOne({ tier });
        if (existingPlan) {
            return res.status(400).json({
                success: false,
                message: `A plan with tier '${tier}' already exists.`
            });
        }

        const plan = new Plan({
            tier,
            price,
            currency,
            features,
            description,
            isListing,
            featureQuota,
            topQuota
        });

        await plan.save();

        return res.status(201).json({ success: true, plan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getPlans = async (req, res) => {
    try {
        const { tier, q } = req.query;
        const filter = {};

        const allowedTiers = ['free', 'medium', 'premium', 'custom'];
        if (tier) {
            if (!allowedTiers.includes(tier.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid tier. Allowed tiers are: ${allowedTiers.join(', ')}`
                });
            }
            filter.tier = tier.toLowerCase();
        }

        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { description: regex },
                { features: regex }
            ];
        }

        const plans = await Plan.find(filter).sort({ price: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: plans.length,
            plans
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        return res.json({ success: true, plan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updatePlan = async (req, res) => {
    try {
        const {
            tier,
            price,
            currency,
            features,
            description,
            isListing,
            featureQuota,
            topQuota
        } = req.body;

        const { id } = req.params;
        const plan = await Plan.findById(id);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        // Check duplicate tier
        if (tier && tier !== plan.tier) {
            const existingTier = await Plan.findOne({ tier });
            if (existingTier) {
                return res.status(400).json({
                    success: false,
                    message: `A plan with tier '${tier}' already exists.`
                });
            }
        }

        // Update only provided fields
        if (tier !== undefined) plan.tier = tier;
        if (price !== undefined) plan.price = price;
        if (currency !== undefined) plan.currency = currency;
        if (features !== undefined) plan.features = features;
        if (description !== undefined) plan.description = description;
        if (isListing !== undefined) plan.isListing = isListing;
        if (featureQuota !== undefined) plan.featureQuota = featureQuota;
        if (topQuota !== undefined) plan.topQuota = topQuota;

        await plan.save();
        return res.status(200).json({ success: true, plan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        return res.json({ success: true, message: 'Plan deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { createPlan, getPlans, getPlanById, updatePlan, deletePlan };
