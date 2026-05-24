import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    // Foreign Key ng Admin (ARRAY NA)
    adminId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userloginschemas",
        required: true,
      },
    ],

    // Email ng nagsend
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Suggestion message
    suggestion: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Suggestion = mongoose.model("Suggestion", suggestionSchema);

export default Suggestion;