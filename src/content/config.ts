// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const jsonDataCollection = defineCollection({
  type: 'data',
  schema: z.object({
    //Define JSON-file structure
    telephone: z.string(),
    email: z.string().email(),
    website: z.string().url(),
    location: z.string(),
    github: z.string().url(),
    linkedin: z.string().url(),
  }),
});

export const collections = {
  staticData: jsonDataCollection,
};
