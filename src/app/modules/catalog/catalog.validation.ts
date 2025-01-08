import { z } from "zod";

const catelogValidationSchema = z.object({
  body:z.object({
    industry: z.string().nonempty("Industry is required"),
    subIndustries: z.array(z.string().nonempty()).nonempty("At least one sub-industry is required"),
    categories: z.array(z.string().nonempty()).nonempty("At least one category is required"),
    subCategories: z.array(z.string().nonempty()).nonempty("At least one sub-category is required"),
    skills: z.array(z.string().nonempty()).nonempty("At least one skill is required"),
  })
});

export const catalogValidations = {
    catelogValidationSchema
}