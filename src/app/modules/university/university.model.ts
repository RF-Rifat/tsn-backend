import { model, Schema } from "mongoose";
import { UniversityData } from "./university.interface";

const UniversitySchema = new Schema<UniversityData>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Public', 'Private', 'International'],
      required: true,
    },
    ranking: {
      national: {
        type: Number,
        required: true,
      },
      qs: {
        type: Number,
        required: true,
      },
    },
    programs: {
      type: [String],
      required: true,
    },
    intakes: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tuitionFees: {
      undergraduate: {
        type: String,
        required: true,
      },
      postgraduate: {
        type: String,
        required: true,
      },
    },
    facilities: {
      type: [String],
      required: true,
    },
    admissionRequirements: {
      type: [String],
      required: true,
    },
    scholarships: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const University = model<UniversityData>('University', UniversitySchema);