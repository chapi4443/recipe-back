const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide recipe name"],
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    ingredients: {
      type: String,
      required: true,
    },
preparationSteps: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    categories: {
      type:String,
      required: true,
    },
    minutes: {
      type: Number,
      required: true,
    },
    cal: {
      type: Number,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);




// const mongoose = require("mongoose");

// const recipeSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     ingredients: [
//       {
//         name: {
//           type: String,
//           required: true,
//         },
//         quantity: {
//           type: String,
//           required: true,
//         },
//       },
//     ],
//     preparationSteps: {
//       type: String,
//       required: true,
//     },
//     categories: {
//       type: [String],
//     },
//     image: {
//       type: String,
//       default: "/uploads/example.jpeg",
//     },
//     averageRating: {
//       type: Number,
//       default: 0,
//     },
//     numOfReviews: {
//       type: Number,
//       default: 0,
//     },
//     user: {
//       type: mongoose.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
// );

// recipeSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });
// recipeSchema.pre("remove", async function (next) {
//   // remove  all reviews from the database and remove them from the database table
//   await this.model("Review").deleteMany({ product: this._id });
// });

// module.exports = mongoose.model('recipe', recipeSchema);
