const express = require("express");
const router = express.Router();

const multer = require("multer");



const productController = require("../controllers/recipeController");
const {
  // createRecipe,
  getAllRecipes,
  getSingleRecipes,
  updateRecipeById,
  deleteRecipeById,
  uploadImage,
  createRecipe,
  likeProduct
} = require("../controllers/recipeController");

const storage = multer.diskStorage({
  destination: "./public/recipe", // Specify your desired destination folder
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLocaleLowerCase().split(" ").join("-");
    console.log(fileName);
    cb(null, Date.now() + fileName);
  },
});
const upload = multer({ storage: storage });
router.post("/createRecipe", upload.single("image"), createRecipe);

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const { getSingleProductReviews } = require("../controllers/reviewController");

router
  .route("/")
  .post([authenticateUser], upload.single("image"), createRecipe)
  .get(getAllRecipes);

router.route("/uploadImage").post([authenticateUser], uploadImage);

router
  .route("/:id")
  .get(getSingleRecipes)
  .patch([authenticateUser], updateRecipeById)
  .delete([authenticateUser], deleteRecipeById);

router.post("/:id/like", authenticateUser, likeProduct);


router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
