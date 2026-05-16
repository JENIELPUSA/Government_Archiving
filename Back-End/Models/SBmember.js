const mongoose = require("mongoose");

const SBschema = new mongoose.Schema({
  avatar: {
    url: String,
    public_id: String,
  },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  district: String,
  detailInfo: String,
  term: String,
  priorityNumber: {
    type: Number,
  },
  isExOfficial: {
    type: Boolean,
    default: false
  },
  year_from: { type: Number },
  year_to: { type: Number },
  term_from: { type: Date },
  term_to: { type: Date },
  middle_name: String,
  Position: String,
  subPosition: String,

  // BINAGO: Ang 'summary' ay Array na ng Objects. Bawat object ay may title at subTitle.
  summary: [{
    title: {
      type: String,
      trim: true,
      default: ""
    },
    subTitle: [{
      type: String,
      trim: true
    }],
    specificname: {
      type: String,
      enum:["Education_Experience","Work_Experience","Others"]
    }
  }],

  created_at: { type: Date, default: Date.now },
});

// PRE-SAVE HOOK: Pinoproseso ang BAWAT summary object bago i-save
SBschema.pre('save', function (next) {
  if (this.isModified('summary')) {
    // Siguraduhing array ang summary
    if (!Array.isArray(this.summary)) {
      this.summary = [];
    }

    // I-loop ang bawat summary item
    this.summary = this.summary.map(summaryItem => {
      // Siguraduhing may subTitle array
      if (!summaryItem.subTitle || !Array.isArray(summaryItem.subTitle)) {
        summaryItem.subTitle = [];
      }

      const rawTitle = summaryItem.title ? summaryItem.title.trim() : "";

      // Regex para huliin ang mga taon (e.g., 2025-PRESENT, 2018-2022, 1975)
      const yearRegex = /(\d{2,4}[-\s]?(?:PRESENT|\d{2,4}))|(\d{2}\/\d{4}-\d{2}\/\d{4})|(\b\d{4}\b)/i;

      // Regex para sa mga descriptors gaya ng "1 TERM"
      const termRegex = /\b\d+\s*TERM\b/i;

      if (rawTitle) {
        const yearMatch = rawTitle.match(yearRegex);
        const termMatch = rawTitle.match(termRegex);

        let detectedYear = yearMatch ? yearMatch[0] : "";
        let detectedTerm = termMatch ? termMatch[0] : "";

        // Gumawa ng bagong subTitle array para hindi madoble
        let newSubTitles = [...summaryItem.subTitle];

        if (detectedYear || detectedTerm) {
          // Linisin ang Title gamit ang pagtanggal ng nakuha nang Taon at Term
          let cleanedTitle = rawTitle
            .replace(yearRegex, '')
            .replace(termRegex, '')
            .replace(/^[,\s-]+|[,\s-]+$/g, '') // Tanggalin ang natirang kuwit o gitling sa dulo o umpisa
            .trim();

          summaryItem.title = cleanedTitle;

          // I-push ang mga nahanap na detalye kung wala pa
          if (detectedTerm && !newSubTitles.includes(detectedTerm)) {
            newSubTitles.push(detectedTerm);
          }
          if (detectedYear && !newSubTitles.includes(detectedYear)) {
            newSubTitles.push(detectedYear);
          }
        }

        summaryItem.subTitle = newSubTitles;
      } else if (!rawTitle && summaryItem.subTitle.length === 0) {
        // Kung empty ang title at walang subTitles, i-clear
        summaryItem.title = "";
        summaryItem.subTitle = [];
      }

      return summaryItem;
    });

    // Remove empty summary items (walang title at walang subTitle)
    this.summary = this.summary.filter(item =>
      item.title.trim() !== "" || item.subTitle.length > 0
    );
  }
  next();
});

module.exports = mongoose.model("SBmember", SBschema);