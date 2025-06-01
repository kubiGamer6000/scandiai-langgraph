/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { WhatsappMessageArraySchema } from "./schemas.js";
import { z } from "zod";
import axios from "axios";

// import {

//   GoogleCalendarCreateTool,
//   GoogleCalendarViewTool,
// } from "@langchain/community/tools/google_calendar";

/**
 * Tavily search tool configuration
 * This tool allows the agent to perform web searches using the Tavily API.
 */
const searchTavily = new TavilySearch({
  maxResults: 6,
  topic: "general",
  searchDepth: "advanced",

  // includeAnswer: false,
  // includeRawContent: false,
  // includeImages: false,
  // includeImageDescriptions: false,
  // searchDepth: "basic",
  // timeRange: "day",
  // includeDomains: [],
  // excludeDomains: [],
});

const finalResponseTool = tool(async () => "mocked value", {
  name: "RespondWithWhatsappMessage",
  description: `Always respond to the user using this tool. 
    You can send multiple messages if you want, or use reaction messages to react to a specific message earlier in the chat.
    Here is how you should send a text message:

{ "text": "hello" }

Here is how you should send a reaction:
{
  "react": {
    "text": "💖",
    "key": {
      "remoteJid": "1234@s.whatsapp.net",
      "fromMe": false,
      "id": "ASDF123"
    }
  }
}
`,
  schema: WhatsappMessageArraySchema,
});

const JoinMeetingSchema = z.object({
  meetingLink: z
    .string()
    .url()
    .describe("A valid link to a Google Meet or Zoom meeting"),
  botName: z
    .string()
    .describe(
      "The name of the bot to join the meeting. ONLY use if user specified specific name, otherwise it defaults to 'Notetaker'"
    )
    .optional(),
});

const joinMeetingTool = tool(
  async (input: z.infer<typeof JoinMeetingSchema>) => {
    const options = {
      method: "POST",
      url: "https://app.attendee.dev/api/v1/bots",
      headers: {
        Authorization: "Token ycSiGjHsuXBTHA4rmf9OzrqkMPhy806R",
        "Content-Type": "application/json",
      },
      data: {
        meeting_url: input.meetingLink,
        bot_name: input.botName || "Notetaker",
        transcription_settings: {
          openai: {
            model: "gpt-4o-transcribe",
          },
        },
      },
    };

    try {
      const { data } = await axios.request(options);

      return `Success! Response: Meeting bot with ID ${data.id}, status ${data.state}, transcription state ${data.transcription_state}, recording state ${data.recording_state}, meeting URL: ${data.meeting_url}.`;
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  },
  {
    name: "JoinMeeting",
    description: `Send a recording bot to join an online meeting. The bot provides a transcript and recording. Always let the user know the meeting bot id.`,
    schema: JoinMeetingSchema,
  }
);

/**
 * Google Calendar tools configuration
 * This tool allows the agent to create and view events in the user's Google Calendar.
 */
// const googleCalendarParams = {
//   credentials: {
//     clientEmail: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
//     privateKey: process.env.GOOGLE_CALENDAR_PRIVATE_KEY,
//     calendarId: process.env.GOOGLE_CALENDAR_CALENDAR_ID,
//   },
//   scopes: [
//     "https://www.googleapis.com/auth/calendar",
//     "https://www.googleapis.com/auth/calendar.events",
//   ],
// };

/**
 * Export an array of all available tools
 * Add new tools to this array to make them available to the agent
 *
 * Note: You can create custom tools by implementing the Tool interface from @langchain/core/tools
 * and add them to this array.
 * See https://js.langchain.com/docs/how_to/custom_tools/#tool-function for more information.
 */
export const TOOLS = [searchTavily, finalResponseTool];
