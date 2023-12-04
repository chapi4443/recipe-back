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
  likeProduct,
  createComment
} = require("../controllers/recipeController");


const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const { getSingleProductReviews } = require("../controllers/reviewController");

router.route("/").post(createRecipe).get(getAllRecipes);

router.route("/uploadImage").post([authenticateUser], uploadImage);

router
  .route("/:id")
  .get(getSingleRecipes)
  .patch([authenticateUser], updateRecipeById)
  .delete([authenticateUser], deleteRecipeById);

router.post("/:id/like", authenticateUser, likeProduct);


router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
