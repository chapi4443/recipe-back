const Product = require("../models/recipe");
const Like = require("../models/like");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createRecipe = async (req, res) => {
  try {
    const {
      name,
      ingredients,
      preparationSteps,
      categories,
      minutes,
      cal,
      image,
      user,
    } = req.body;
    const recipe = new Product({
      name,
      ingredients,
      preparationSteps,
      categories,
      minutes,
      cal,
      image,
      user,
    });
    await recipe.save();
    res.status(201).send(recipe);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("reviews")
      .populate({ path: "likes", select: "user" })
      .populate({ path: "comments", select: "user" }); // Populate the comments field with user only

    // Map through products and calculate the total likes and comments for each product
    const productsWithDetails = products.map((product) => {
      const likesDetails = product.likes.map((like) => ({
        _id: like._id,
        user: like.user,
        product: like.product,
      }));

      const commentsDetails = product.comments.map((comment) => ({
        _id: comment._id,
        user: comment.user,
        product: comment.product,
      }));

      return {
        ...product.toObject(),
        likes: {
          details: likesDetails,
          count: likesDetails.length,
        },
        comments: {
          details: commentsDetails,
          count: commentsDetails.length,
        },
      };
    });

    res
      .status(StatusCodes.OK)
      .json({ products: productsWithDetails, count: products.length });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getSingleRecipes = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId })
      .populate("reviews")
      .populate({ path: "likes", select: "user" })
      .populate({ path: "comments", select: "user" }); // Populate the comments field with user only

    if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    // Include both detailed likes and comments information, and total counts in the response
    const likesDetails = product.likes.map((like) => ({
      _id: like._id,
      user: like.user,
      product: like.product,
    }));

    const commentsDetails = product.comments.map((comment) => ({
      _id: comment._id,
      user: comment.user,
      product: comment.product,
    }));

    const response = {
      product: {
        ...product.toObject(),
        likes: {
          details: likesDetails,
          count: likesDetails.length,
        },
        comments: {
          details: commentsDetails,
          count: commentsDetails.length,
        },
      },
    };

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const updateRecipeById = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const deleteRecipeById = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

const uploadImage = async (req, res) => {
  try {
    if (!req.files) {
      throw new CustomError.BadRequestError("No File Uploaded");
    }
    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith("image")) {
      throw new CustomError.BadRequestError("Please Upload Image");
    }

    const maxSize = 1024 * 1024;

    if (productImage.size > maxSize) {
      throw new CustomError.BadRequestError(
        "Please upload an image smaller than 1MB"
      );
    }

    // Assuming you have a productId parameter in the request body
    const productId = req.body.productId;

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      throw new CustomError.NotFoundError("Product not found");
    }

    // Move the image to the uploads directory
    const imagePath = path.join(
      __dirname,
      "../public/uploads/" + `${productImage.name}`
    );
    await productImage.mv(imagePath);

    // Update the product's image field
    product.image = `/uploads/${productImage.name}`;
    await product.save();

    res.status(StatusCodes.OK).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const likeProduct = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    // const userId = req.user.userId;

    // Check if the user has already liked the product
    const existingLike = await Like.findOne({
      user: userId,
      product: productId,
    });

    if (existingLike) {
      // User has already liked the product, so unlike it
      await Like.deleteOne({
        user: userId,
        product: productId,
      });

      // Decrement the like count in the Product model
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { numOfLikes: -1 } },
        { new: true }
      );

      res
        .status(StatusCodes.OK)
        .json({ product, message: "Product unliked successfully" });
    } else {
      // User hasn't liked the product, so like it
      const like = new Like({ user: userId, product: productId });
      await like.save();

      // Increment the like count in the Product model
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { numOfLikes: 1 } },
        { new: true }
      );

      res
        .status(StatusCodes.OK)
        .json({ product, message: "Product liked successfully" });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
const createComment = async (req, res) => {
  try {
    req.body.user = req.user.userId;
    const comment = new Comment(req.body);
    await comment.save();

    // Add the comment to the product's comments
    const product = await Product.findByIdAndUpdate(
      req.body.product,
      { $push: { comments: comment._id } },
      { new: true }
    );

    res.status(StatusCodes.CREATED).json({ comment, product });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getSingleRecipes,
  updateRecipeById,
  deleteRecipeById,
  uploadImage,
  likeProduct,
  createComment
};

// const Recipe = require("../models/recipe");
// const { StatusCodes } = require("http-status-codes");
// const CustomError = require("../errors");
// const path = require("path");

// const createRecipe = async (req, res) => {
//   try {
//     req.body.user = req.user.userId;
//     const recipe = new Recipe(req.body);
//     await recipe.save();
//     res.status(201).send(recipe);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };
// const getAllRecipes = async (req, res) => {
//   try {
//     const recipes = await Recipe.find();
//     res.send(recipes);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// const getRecipeById = async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) {
//       return res.status(404).send({ error: "Recipe not found" });
//     }
//     res.send(recipe);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// const updateRecipeById = async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = [
//     "title",
//     "description",
//     "ingredients",
//     "preparationSteps",
//     "categories",
//   ];

//   const isValidOperation = updates.every((update) =>
//     allowedUpdates.includes(update)
//   );

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "Invalid updates!" });
//   }

//   try {
//     const recipe = await Recipe.findById(req.params.id);

//     if (!recipe) {
//       return res.status(404).send({ error: "Recipe not found" });
//     }

//     updates.forEach((update) => (recipe[update] = req.body[update]));
//     await recipe.save();

//     res.send(recipe);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

// const deleteRecipeById = async (req, res) => {
//   try {
//     const recipe = await Recipe.findByIdAndDelete(req.params.id);

//     if (!recipe) {
//       return res.status(404).send({ error: "Recipe not found" });
//     }

//     res.send(recipe);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// const uploadImage = async (req, res) => {
//   if (!req.files) {
//     throw new CustomError.BadRequestError("No File Uploaded");
//   }
//   const productImage = req.files.image;

//   if (!productImage.mimetype.startsWith("image")) {
//     throw new CustomError.BadRequestError("Please Upload Image");
//   }

//   const maxSize = 1024 * 1024;

//   if (productImage.size > maxSize) {
//     throw new CustomError.BadRequestError(
//       "Please upload image smaller than 1MB"
//     );
//   }

//   const imagePath = path.join(
//     __dirname,
//     "../public/uploads/" + `${recipeImage.name}`
//   );
//   await productImage.mv(imagePath);
//   res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
// };

// module.exports = {
//   createRecipe,
//   getAllRecipes,
//   getRecipeById,
//   updateRecipeById,
//   deleteRecipeById,
//   uploadImage
// };
