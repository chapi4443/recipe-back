const Product = require("../models/recipe");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");


const createRecipe = async (req, res) => {
  try {
      console.log("image", req.file);
      console.log("body", req.o);
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

    // Extract fields from the request body
    const {
      name,
      ingredients,
      preparationSteps,
      // description,
      categories,
      minutes,
      cal,
      
    } = req.body;
    console.log(data);
    const fileName = req.file.fileName;
    // Check if productId is provided in the request body
    const productId = req.body.productId;

    let product;

    // Find the product by ID or create a new one
    if (productId) {
      product = await Product.findById(productId);

      if (!product) {
        throw new CustomError.NotFoundError("Product not found");
      }

      // Update the existing product details dynamically
      const fieldsToUpdate = {
        name,
        ingredients,
        preparationSteps,
        description,
        categories,
        image: "http://localhost:5000" + "/recipe/" + fileName,
        minutes,
        cal,
      };
      Object.entries(fieldsToUpdate).forEach(([key, value]) => {
        if (value !== undefined) {
          product[key] = value;
        }
      });
    } else {
      // Create a new product
      req.body.user = req.user.userId;
      product = new Product(req.body);
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

    // Respond with success message
    res.status(StatusCodes.OK).json({ message: "Recipe created with image" });
  } catch (error) {
    console.error("Error creating recipe with image:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// const createRecipe = async (req, res) => {
//   try {
//     req.body.user = req.user.userId;
//     const recipe = new Product(req.body);
//     await recipe.save();
//     res.status(201).send(recipe);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };
const getAllRecipes = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleRecipes = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
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
    res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getSingleRecipes,
  updateRecipeById,
  deleteRecipeById,
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
