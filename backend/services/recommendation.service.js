const User = require('../models/user');
const IDP = require('../models/idp');
const Resource = require('../models/resource');
const logger = require('../config/logger');

/**
 * Recommendation Service
 * ----------------------------------------------------
 * Generates resource recommendations directly in Node.js.
 * Replaces the previous Python-based microservice.
 */

/**
 * Trigger a recommendation job.
 * Generates recommendations based on the skills in the IDP.
 * 
 * @param {Object} jobData - Data required (userId, idpId)
 * @returns {Promise<boolean>} - True if successful
 */
const addJob = async (jobData) => {
    // Run asynchronously to not block the caller (fire-and-forget style if not awaited)
    // However, since this is now in-process, we should catch errors to avoid crashing node.
    generateRecommendations(jobData.userId, jobData.idpId).catch(err => {
        logger.error(`Error generating recommendations for user ${jobData.userId}:`, err);
    });
    return true;
};

/**
 * Core logic to generate recommendations
 */
const generateRecommendations = async (userId, idpId) => {
    logger.info(`Starting recommendation generation for IDP: ${idpId}`);

    try {
        const idp = await IDP.findById(idpId).populate('skillsToImprove.skill');
        if (!idp) {
            logger.error(`IDP not found: ${idpId}`);
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            logger.error(`User not found: ${userId}`);
            return;
        }

        // 1. Identify Target Skills
        // Filter out any skills that might be null (if skill was deleted)
        const skillsToImprove = idp.skillsToImprove.filter(s => s.skill);

        if (skillsToImprove.length === 0) {
            logger.info('No valid skills to improve found in IDP, skipping recommendations.');
            return;
        }

        // 2. Find Resources matching these skills
        // Simple logic: Find resources that match the skill ID.
        // We could limit to e.g. 5 per skill.
        const recommendedResources = [];

        for (const skillItem of skillsToImprove) {
            const matches = await Resource.find({
                skill: skillItem.skill._id,
                // Optional: Filter by visibility (e.g. public or team-specific)
                // For now, assuming all resources are available
            })
                .limit(5)
                .sort({ createdAt: -1 }); // Newest first, or could assume simple logic

            for (const resource of matches) {
                // Avoid duplicates
                if (!recommendedResources.some(r => r.resource.toString() === resource._id.toString())) {
                    recommendedResources.push({
                        resource: resource._id,
                        status: 'pending',
                        evidence: '',
                        verificationMethod: 'none'
                    });
                }
            }
        }

        // 3. Update IDP
        idp.recommendedResources = recommendedResources;
        idp.status = 'active'; // Mark as ready/active
        await idp.save();

        logger.info(`Recommendations generated for IDP ${idpId}. Found ${recommendedResources.length} resources.`);

    } catch (error) {
        logger.error(`Recommendation Logic Error:`, error);
        throw error;
    }
};

module.exports = {
    addJob
};
