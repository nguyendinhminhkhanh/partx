const uploadClound = async (req, res) => {
  try {
    res.json({
      success: 1,
      message: "Upload file thành công",
      url: req.file.path,
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      message: "Lỗi upload file",
    });
  }
};
module.exports = { uploadClound };
