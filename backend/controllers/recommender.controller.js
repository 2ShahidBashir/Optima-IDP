const RecommenderService = require("../services/recommender.service");
const User = require("../models/user");
const Skill = require("../models/skill");
const Resource = require("../models/resource");
const PerformanceReport = require("../models/PerformanceReport");
const IDP = require("../models/idp");

exports.getSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        // Expect targetSkills in body, e.g., [{ skillId: "...", targetLevel: 5 }]
        const { targetSkills } = req.body;

        // 1. Fetch User Data (Current Skills)
        const user = await User.findById(userId).populate("skills.skillId").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transform user skills to format expected by Python service
        // Python expects: { "skillId": "...", "level": 3 }
        const userSkills = user.skills.map(s => ({
            skillId: s.skillId._id.toString(),
            level: s.level
        }));

        // 2. Fetch Performance Reports (for context)
        // Python expects: [{ "skillId": "...", "score": 8, "feedback": "..." }]
        // We'll just fetch recent ones
        const reports = await PerformanceReport.find({ employee: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Transform reports if necessary, or pass as is (depending on what Python expects)
        // Based on python schema: List[Dict[str, Any]]
        // Let's sanitize slightly
        const performanceReports = reports.map(r => ({
            ...r,
            _id: r._id.toString()
        }));

        // 3. Fetch System Data (All Skills & Resources)
        // This is the "heavy" part for the stateless architecture
        const allSkills = await Skill.find({}).lean();
        const allResources = await Resource.find({}).lean();

        // 4. Fetch Peer Data (Collaborative Filtering)
        // Get all other users and their approved/completed IDPs
        // Ideally, in a large system, this would be a pre-calculated matrix or vector DB lookup.
        const allUsers = await User.find({ _id: { $ne: userId } })
            .select("skills role")
            .lean();

        const allIDPs = await IDP.find({
            status: { $in: ["approved", "completed"] },
            employee: { $ne: userId }
        }).select("employee recommendedResources").lean();

        // Create a map of user -> used resources
        const userResourcesMap = {};
        allIDPs.forEach(idp => {
            const empId = idp.employee.toString();
            if (!userResourcesMap[empId]) userResourcesMap[empId] = new Set();
            idp.recommendedResources.forEach(rId => userResourcesMap[empId].add(rId.toString()));
        });

        const peerData = allUsers.map(peer => ({
            userId: peer._id.toString(),
            skills: peer.skills.map(s => ({
                skillId: s.skillId.toString(),
                level: s.level || 1
            })),
            resources: Array.from(userResourcesMap[peer._id.toString()] || [])
        })).filter(p => p.resources.length > 0 || p.skills.length > 0);


        // Sanitize IDs
        const formattedSkills = allSkills.map(s => ({
            ...s,
            _id: s._id.toString()
        }));

        const formattedResources = allResources.map(r => ({
            ...r,
            _id: r._id.toString(),
            skill: r.skill ? { ...r.skill, _id: r.skill.toString() } : null
        }));

        // 5. Construct Payload
        // Match RecommendationRequest model in Python
        const payload = {
            user_skills: userSkills,
            skills_to_improve: targetSkills || [], // [{ "skillId": "...", "gap": ... }]
            performance_reports: performanceReports,
            resources: formattedResources,
            skills: formattedSkills,
            user_skills_data: [], // Legacy field, keeping for compatibility if needed
            peer_data: peerData,  // NEW: Data for collaborative filtering
            limit: 10,
            persona: user.role // "employee", "manager", etc.
        };

        // 6. Call Python Service
        // We reuse the existing service wrapper
        const recommendations = await RecommenderService.getRecommendedResources(payload);

        return res.status(200).json(recommendations);

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ message: "Failed to generate suggestions", error: error.message });
    }
};
