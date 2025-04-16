exports.getAdminData = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    data: {
      adminFeatures: ["user management", "content moderation", "analytics"],
      timestamp: new Date().toISOString(),
    },
  });
};
