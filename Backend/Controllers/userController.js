const UserProfile = require('../Models/userProfile');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await UserProfile.findById(req.params.userId); // Updated to use userId
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await UserProfile.findByIdAndUpdate(req.params.userId, req.body, { new: true }); // Updated to use userId
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
