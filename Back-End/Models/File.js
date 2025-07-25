const mongoose = require("mongoose");

const ArchivingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      default: null,
    },
    summary: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    fullText: {
      type: String,
      required: true,
    },
    fileSize: Number,
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Review", "Approved", "Rejected", "Draft"],
      default: "Draft",
    },
    tags: {
      type: [String],
      default: [],
    },
    ArchivedStatus: {
      type: String,
      enum: ["Active", "Archived", "Deleted", "For Restore", "Pending Review"],
      default: "Active",
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
    archivedMetadata: {
      dateArchived: {
        type: Date,
      },
      archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      notes: {
        type: String,
        trim: true,
      },
    },
    suggestion: {
      type: String,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Remove empty archivedMetadata before save
ArchivingSchema.pre("save", function (next) {
  // Generate tags if not provided
  if (!this.tags || this.tags.length === 0) {
    const text = `${this.title} ${this.summary}`.toLowerCase();
    const stopWords = [
      "the",
      "is",
      "at",
      "which",
      "on",
      "a",
      "an",
      "and",
      "of",
    ];
    const words =
      text
        .match(/\b\w+\b/g)
        ?.filter((w) => w.length > 3 && !stopWords.includes(w)) || [];

    this.tags = [...new Set(words)].slice(0, 5);
  }

  // Auto-add archivedMetadata if ArchivedStatus is 'Archived' and metadata is not present
  if (
    this.ArchivedStatus === "Archived" &&
    !this.archivedMetadata?.dateArchived
  ) {
    this.archivedMetadata = {
      dateArchived: new Date(),
      archivedBy: this.admin || null,
      notes: "Auto-archived during save",
    };
  }

  // Remove archivedMetadata if all fields are undefined/null
  const meta = this.archivedMetadata;
  if (
    meta &&
    !meta.dateArchived &&
    !meta.archivedBy &&
    (meta.notes === undefined || meta.notes === "")
  ) {
    this.archivedMetadata = undefined;
  }

  next();
});

module.exports = mongoose.model("Files", ArchivingSchema);
