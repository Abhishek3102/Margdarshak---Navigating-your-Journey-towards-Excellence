const RecommendationService = require('../Services/recommendationService');

exports.getRecommendations = async (req, res) => {
    try {
        const recommendations = await RecommendationService.getRecommendations(req.body.userId);
        res.json({ recommendations });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
