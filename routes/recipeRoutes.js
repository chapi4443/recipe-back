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
<<<<<<< HEAD
=======
  createComment
>>>>>>> c139428e0feaa1294a6fbd2c27261bdad29a236e
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

router.post("/like", authenticateUser, likeProduct);

router.post("/comments", authenticateUser, createComment);
router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
