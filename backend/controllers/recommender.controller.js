const Resource = require("../models/resource");
const Skill = require("../models/skill");

/**
 * Recommender Controller
 * ----------------------------------------------------
 * Handles logic for generating IDP recommendations (Node.js replacement for Python service).
 */

exports.getSuggestions = async (req, res) => {
    try {
        const { targetSkills } = req.body;

        if (!targetSkills || !Array.isArray(targetSkills) || targetSkills.length === 0) {
            return res.status(400).json({ message: "Invalid target skills" });
        }

        const recommendations = [];
        const seenResourceIds = new Set();

        for (const item of targetSkills) {
            const skillId = item.skillId || item.skill;
            const targetLevel = item.targetLevel || 5;

            if (!skillId) continue;

            // Find resources matching the skill
            // We can prioritize resources close to the target level
            const resources = await Resource.find({ skill: skillId })
                .limit(10)
                .sort({ updatedAt: -1 });

            for (const resource of resources) {
                if (seenResourceIds.has(resource._id.toString())) continue;
                seenResourceIds.add(resource._id.toString());

                // Calculate a compatibility score (mock logic since we don't have ML)
                // Heuristic: 
                // 1. Difficulty match:
                //    Beginner ~ 1-3
                //    Intermediate ~ 4-7
                //    Advanced ~ 8-10
                // Calculate gap between targetLevel and resource level.

                let resourceLevel = 1;
                if (resource.difficulty === 'intermediate') resourceLevel = 5;
                if (resource.difficulty === 'advanced') resourceLevel = 9;
                if (resource.targetLevel) resourceLevel = resource.targetLevel;

                const gap = Math.abs(targetLevel - resourceLevel);
                const score = Math.max(0.1, 1 - (gap * 0.1)); // Simple linear decay based on level match

                recommendations.push({
                    resourceId: resource._id,
                    title: resource.title,
                    provider: resource.provider || "Unknown",
                    type: resource.type,
                    difficulty: resource.difficulty,
                    score: parseFloat(score.toFixed(2)),
                    scoreBreakdown: {
                        skill_gap: gap
                    }
                });
            }
        }

        // Sort by score descending
        recommendations.sort((a, b) => b.score - a.score);

        res.json({ recommendations });

    } catch (error) {
        console.error("Recommender suggestions error:", error);
        res.status(500).json({ message: "Failed to generate suggestions", error: error.message });
    }
};
