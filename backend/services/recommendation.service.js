const User = require('../models/user');
const IDP = require('../models/idp');
const Resource = require('../models/resource');
const logger = require('../config/logger');

/**
 * Recommendation Service
 * ----------------------------------------------------
 * Generates resource recommendations directly in Node.js.
 */

/**
 * Core logic to generate recommendations
 * Returns the list of recommended resources.
 */
const getRecommendations = async (userId, skillsToImproveArg) => {
    try {
        // 1. Identify Target Skills
        // skillsToImproveArg can be from IDP object or passed directly
        // Ensure we handle both "array of strings" and "array of objects with skill prop"
        if (!skillsToImproveArg) return [];
        
        const skillsToQuery = skillsToImproveArg.map(s => s.skill || s._id || s);
        
        if (skillsToQuery.length === 0) {
           return [];
        }

        // 2. Find Resources matching these skills
        const recommendedResources = [];

        for (const skillId of skillsToQuery) {
            // Check if skillId is valid object or string
            if (!skillId) continue;

            const matches = await Resource.find({ 
                skill: skillId
            })
            .limit(5)
            .sort({ createdAt: -1 });

            for (const resource of matches) {
                // Avoid duplicates provided in the list
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
        return recommendedResources;

    } catch (error) {
        logger.error(`Recommendation Logic Error:`, error);
        throw error;
    }
};

/**
 * Helper to update IDP with recommendations (async job)
 */
const updateIDPWithRecommendations = async (userId, idpId) => {
     logger.info(`Starting recommendation generation for IDP: ${idpId}`);
    try {
        const idp = await IDP.findById(idpId);
        if (!idp) {
            logger.error(`IDP not found: ${idpId}`);
            return;
        }
        
        const recs = await getRecommendations(userId, idp.skillsToImprove);

        idp.recommendedResources = recs;
        idp.status = 'active'; 
        await idp.save();

        logger.info(`Recommendations generated for IDP ${idpId}. Found ${recs.length} resources.`);

    } catch (error) {
         logger.error(`Recommendation Job Error:`, error);
    }
};

/**
 * Trigger a recommendation job.
 * @param {Object} jobData - Data required (userId, idpId)
 * @returns {Promise<boolean>} - True if successful
 */
const addJob = async (jobData) => {
    updateIDPWithRecommendations(jobData.userId, jobData.idpId).catch(err => {
        logger.error(`Error generating recommendations for user ${jobData.userId}:`, err);
    });
    return true;
};

module.exports = {
    addJob,
    getRecommendations
};
