import { z } from "zod";

// Define the key object inside the reaction
const MessageKeySchema = z.object({
  remoteJid: z.string(),
  fromMe: z.boolean(),
  id: z.string(),
});

// Define the reaction message structure
const ReactionMessageSchema = z
  .object({
    react: z
      .object({
        text: z.string(),
        key: MessageKeySchema,
      })
      .strict(), // disallow additional properties inside "react"
  })
  .strict(); // disallow additional properties at the root of this object

// Define the text message structure
const TextMessageSchema = z
  .object({
    text: z.string(),
  })
  .strict(); // disallow additional properties

// Combine both types using union
const WhatsappMessageSchema = z.union([
  TextMessageSchema,
  ReactionMessageSchema,
]);

// Define the array schema
const WhatsappMessageArraySchema = z.array(WhatsappMessageSchema).min(0);

export { WhatsappMessageSchema, WhatsappMessageArraySchema };
