const Product = require("../models/recipe");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  try {
    // Extract data from the request body
    const { name, ingredients, categories, minutes, cal } = req.body;

    // Validate required fields
    if (!name || !ingredients || !categories || !minutes || !cal) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields",
        });
    }

    // Construct the recipe object
    const recipeData = {
      name: name,
      ingredients: ingredients,
      image: req.file
        ? "http://localhost:5000/api/v1" + "/recipe/" + req.file.filename
        : "/uploads/default-image.jpg",
      categories: categories,
      minutes: minutes,
      cal: cal,
      averageRating: 0,
      numOfReviews: 0,
      user: req.user.userId, // Assuming userId is available in the request after authentication
    };

    // Create a new Recipe instance using the Recipe model
    const newRecipe = new Product(recipeData);

    // Save the recipe to the database
    const savedRecipe = await newRecipe.save();

    return res.status(201).json({ success: true, recipe: savedRecipe });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
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
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};
const uploadImage = async (req, res) => {
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
      "Please upload image smaller than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
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
