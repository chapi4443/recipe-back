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
    // description: {
    //   type: String,
    //   required: true,
    // },
    image: {
      type: String,
      required: true,
    },
    // image: {
    //   type: String,
    //   default: "/uploads/example.jpeg",
    // },
    categories: {
      type: String,
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

ProductSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);


