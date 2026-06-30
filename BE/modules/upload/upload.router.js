const router = require("express").Router();
const uploadController = require("./upload.controller");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api
  .resources({ type: "upload", max_results: 10 })
  .then((res) => console.log(res.resources.map((r) => r.secure_url)))
  .catch((err) => console.log(err));

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: "partx_uploads" },
  allowed_formats: ["jpg", "png", "jpeg", "gif", "pdf", "docx"],
});

const upload = multer({ storage: storage });
console.log(cloudinary.config());
// [POST] /api/upload
router.post("/", upload.single("file"), uploadController.uploadClound);
//[DELETE] /api/upload/partx_uploads/:public_id
router.delete("/", uploadController.deleteClound);
module.exports = router;
