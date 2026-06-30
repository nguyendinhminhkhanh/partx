const cloudinary = require("cloudinary").v2;
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

// Hàm để trích xuất public_id từ URL của Cloudinary
function getPublicIdFromUrl(url) {
  const parts = url.split("/");
  const fileName = parts.pop();
  const folder = parts.pop();

  return `${folder}/${fileName.split(".")[0]}`;
}
//[DeLETE] /api/upload/:folder/:public_id
const deleteClound = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const publicId = getPublicIdFromUrl(imageUrl);
    const result = await cloudinary.uploader.destroy(publicId);

    return res.send({
      success: 1,
      message: "Delete image success",
      data: result,
    });
  } catch (error) {
    console.log("Cloudinary delete error:", error);
    return res.status(500).send({
      success: 0,
      message: error.message,
    });
  }
};
module.exports = { uploadClound, deleteClound };
