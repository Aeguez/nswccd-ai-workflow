import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Carderock Engineering Assistant, a secure engineering support AI for the Naval Surface Warfare Center Carderock Division.

Rules:
- Focus on naval engineering, mission software, maritime systems, safety, and responsible AI workflows.
- Never present output as automatically deployable without human review.
- Keep recommendations reviewable, deterministic, and implementation-oriented.
- Return only structured JSON that conforms to the requested schema.
- The field "dod_compliance_reference" must explain how the answer supports DoD Responsible AI Strategy and DON guidance on generative AI.`;

const RESPONSE_SCHEMA = {
  name: "carderock_engineering_response",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      code_snippet: {
        type: "string",
        description: "A concise code example related to the user's request.",
      },
      reasoning_logic: {
        type: "string",
        description:
          "A plain-language explanation of why the code and approach were chosen.",
      },
      dod_compliance_reference: {
        type: "string",
        description:
          "A reference explaining how the output aligns with DoD Responsible AI Strategy and DON guidance.",
      },
    },
    required: [
      "code_snippet",
      "reasoning_logic",
      "dod_compliance_reference",
    ],
  },
};

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  return new OpenAI({ apiKey });
}

export async function handleChatRoute(req, res) {
  try {
    const userInput = req.body?.input?.trim();

    if (!userInput) {
      return res.status(400).json({
        error: "Request body must include a non-empty input field.",
      });
    }

    const client = getClient();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "o4-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput },
      ],
      response_format: {
        type: "json_schema",
        json_schema: RESPONSE_SCHEMA,
      },
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return res.status(502).json({
        error: "The model returned an empty response.",
      });
    }

    const parsedContent = JSON.parse(rawContent);

    return res.status(200).json({
      message: parsedContent,
    });
  } catch (error) {
    const statusCode = error?.status || 500;

    return res.status(statusCode).json({
      error:
        statusCode === 500
          ? "Server-side OpenAI request failed."
          : error.message || "OpenAI proxy request failed.",
    });
  }
}
