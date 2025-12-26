exports.getSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { targetSkills } = req.body || {};

        // 1. Determine skills to look for
        let skillsToQuery = [];

        if (targetSkills && targetSkills.length > 0) {
            skillsToQuery = targetSkills.map(s => s.skillId);
        } else {
            // Default: Fetch user skills and find gaps?
            // Or just return recent resources?
            // For now, let's fetch user's skills and recommend intermediate/advanced for them
            const user = await User.findById(userId).populate('skills.skillId');
            if (user && user.skills) {
                skillsToQuery = user.skills.map(s => s.skillId._id);
            }
        }

        // 2. Find Resources
        // Convert to strings for query
        const skillIds = skillsToQuery.map(id => String(id));

        const resources = await Resource.find({
            skill: { $in: skillIds }
        })
            .limit(20)
            .populate("skill")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        // 3. Format Response to match expected frontend structure (if any)
        // Frontend likely expects "recommendations" array
        const recommendations = resources.map(r => ({
            resourceId: r._id,
            title: r.title,
            provider: r.provider,
            type: r.type,
            url: r.url,
            // Add other fields as needed
            skill: r.skill ? { name: r.skill.name } : {},
            score: 1.0 // Dummy score
        }));

        res.json({
            recommendations,
            skillsToImprove: [] // Dummy
        });

    } catch (error) {
        logger.error(`Controller Error: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: "Failed to generate suggestions", error: error.message });
    }
};

/**
 * TRACK USER FEEDBACK
 * POST /api/recommend/feedback
 */
exports.trackFeedback = async (req, res) => {
    try {
        const userId = req.user._id;
        const { resourceId, action } = req.body; // action: 'like', 'dislike', 'dismiss', 'click'

        if (!resourceId || !action) {
            return res.status(400).json({ message: "Missing resourceId or action" });
        }

        // Upsert feedback (if user changes mind from like to dislike, update it)
        // Or strictly log history? For simple recommender filtering, upserting latest unique action is easier
        // But for ML training, log history is better.
        // Let's just create a new record for history.
        await Feedback.create({
            user: userId,
            resource: resourceId,
            action
        });

        res.json({ message: "Feedback recorded" });

    } catch (error) {
        console.error("Feedback Error:", error);
        res.status(500).json({ message: "Failed to record feedback" });
    }
};

exports.getSimilarSkills = async (req, res) => {
    try {
        const { skill_id } = req.body;

        if (!skill_id) {
            return res.status(400).json({ message: "Missing skill_id" });
        }

        const skill = await Skill.findById(skill_id);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // Find skills in same category
        const similar = await Skill.find({
            category: skill.category,
            _id: { $ne: skill._id }
        }).limit(5);

        // Format
        const result = {
            similar_skills: similar.map(s => ({
                id: s._id,
                name: s.name,
                category: s.category,
                similarity: 0.9 // Dummy score
            }))
        };

        res.json(result);

    } catch (error) {
        console.error("Similar Skills Error:", error);
        res.status(500).json({ message: "Failed to fetch similar skills" });
    }
};
