import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";

dotenv.config();

// Utility function to wait for a specified time
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ApiErrorExplain = asyncHandler(async (req, res) => {
  const { errorMessage } = req.body;

  // Validation
  if (!errorMessage || typeof errorMessage !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing errorMessage. Please provide a valid string.",
    });
  }

  const maxRetries = 5;
  let retryCount = 0;
  const baseDelay = 1000; // 1 second base delay

  while (retryCount < maxRetries) {
    try {
      const geminiRes = await axios.post(
        // Updated endpoint with correct model name and version
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `This is the error:\n\n${errorMessage}\n\nSuggest how to fix this issue step-by-step in Hinglish.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1000,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      const explanation =
        geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!explanation) {
        throw new Error("Invalid response from Gemini API");
      }

      return res.status(200).json({
        success: true,
        explanation,
      });
    } catch (error) {
      if (error.response?.status === 429) {
        retryCount++;
        const waitTime = baseDelay * Math.pow(2, retryCount);
        console.log(
          `Rate limit hit. Retrying (${retryCount}/${maxRetries}) after ${
            waitTime / 1000
          }s...`
        );

        if (retryCount === maxRetries) {
          return res.status(429).json({
            success: false,
            error: "Rate limit exceeded. Please try again later.",
            retryAfter: error.response?.headers["retry-after"] || "unknown",
          });
        }

        await delay(waitTime);
        continue;
      }

      if (error.response?.status === 401) {
        return res.status(500).json({
          success: false,
          error: "Invalid Gemini API key configuration",
        });
      }

      if (error.response?.status === 404) {
        console.error("API endpoint error:", error.response.data);
        return res.status(500).json({
          success: false,
          error: "API endpoint not found. Please check the configuration.",
          details: error.response?.data?.error?.message,
        });
      }

      console.error("Gemini API Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      return res.status(500).json({
        success: false,
        error: "Failed to process request. Please try again.",
        details: error.message,
      });
    }
  }
});

export { ApiErrorExplain };