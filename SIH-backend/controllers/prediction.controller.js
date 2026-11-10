import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "GEMINI_API_KEY is not set in environment");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, `Gemini API error: ${text}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

// Illness-wise month-end prediction using user data
export const getIllnessWisePrediction = asyncHandler(async (req, res) => {
  const { illnessName, state, district } = req.query;

  if (!illnessName) {
    throw new ApiError(400, "illnessName parameter is required");
  }

  // Build filter for users with the specific illness
  const filter = {
    "illnesses.illnessName": illnessName
  };

  if (state) {
    filter.currentState = state;
  }

  if (district) {
    filter["address.district"] = district;
  }

  const users = await User.find(filter).select("illnesses currentState address.district");

  if (!users.length) {
    throw new ApiError(404, `No data available for illness: ${illnessName}${state ? ` in ${state}` : ''}${district ? `, ${district}` : ''}`);
  }

  // Extract illness data and group by date
  const illnessData = [];
  users.forEach(user => {
    user.illnesses.forEach(illness => {
      if (illness.illnessName === illnessName && illness.diagnosisDate) {
        illnessData.push({
          date: illness.diagnosisDate.toISOString().split('T')[0],
          location: `${user.currentState}${user.address?.district ? `, ${user.address.district}` : ''}`
        });
      }
    });
  });

  // Group by date and count cases
  const dailyCounts = {};
  illnessData.forEach(item => {
    dailyCounts[item.date] = (dailyCounts[item.date] || 0) + 1;
  });

  // Sort by date
  const sortedDates = Object.keys(dailyCounts).sort();
  const series = sortedDates.map(date => `${date}: ${dailyCounts[date]}`).join("\n");

  // Calculate month-end date
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  const monthEnd = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);

  const locationInfo = state ? ` in ${state}${district ? `, ${district}` : ''}` : '';
  const prompt = `You are an epidemiology assistant. Given the daily illness counts for ${illnessName}${locationInfo} (one per line as YYYY-MM-DD: cases):\n\n${series}\n\nEstimate the total cases for the entire month ending on ${monthEnd.toISOString().split('T')[0]}.\nRespond strictly in JSON with keys: predictedTotal (number), forecastDate (YYYY-MM-DD), method (string), rationale (string), confidence (number 0-100).`;

  const text = await callGemini(prompt);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new ApiError(500, "Failed to parse Gemini response");
    parsed = JSON.parse(match[0]);
  }

  const response = new ApiResponse(200, {
    illnessName,
    location: {
      state: state || "All",
      district: district || "All"
    },
    predictedCases: Math.round(parsed.predictedTotal || 0),
    forecastDate: parsed.forecastDate || monthEnd.toISOString().split('T')[0],
    modelUsed: parsed.method || "gemini",
    confidence: parsed.confidence || 0,
    details: {
      rationale: parsed.rationale || "",
      totalDataPoints: sortedDates.length,
      dateRange: {
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1]
      },
      existingTotal: Object.values(dailyCounts).reduce((sum, count) => sum + count, 0)
    }
  }, "Illness-wise month-end prediction generated successfully");

  res.status(200).json(response);
});

// Location-wise illness prediction
export const getLocationWisePrediction = asyncHandler(async (req, res) => {
  const { state, district } = req.query;

  if (!state && !district) {
    throw new ApiError(400, "Either state or district parameter is required");
  }

  // Build filter
  const filter = {
    illnesses: { $exists: true, $not: { $size: 0 } }
  };

  if (state) {
    filter.currentState = state;
  }

  if (district) {
    filter["address.district"] = district;
  }

  const users = await User.find(filter).select("illnesses currentState address.district");

  if (!users.length) {
    throw new ApiError(404, `No illness data available for ${state || district}`);
  }

  // Extract and group illness data by illness name and date
  const illnessCounts = {};
  users.forEach(user => {
    user.illnesses.forEach(illness => {
      if (illness.illnessName && illness.diagnosisDate) {
        const date = illness.diagnosisDate.toISOString().split('T')[0];
        const illnessName = illness.illnessName;

        if (!illnessCounts[illnessName]) {
          illnessCounts[illnessName] = {};
        }
        illnessCounts[illnessName][date] = (illnessCounts[illnessName][date] || 0) + 1;
      }
    });
  });

  // Get top illnesses for prediction
  const illnessNames = Object.keys(illnessCounts);
  const locationInfo = `${state || 'All'}${district ? `, ${district}` : ''}`;

  const prompt = `You are an epidemiology assistant. Given illness data for location: ${locationInfo}\n\nIllness breakdown:\n${illnessNames.map(illness => {
    const dates = Object.keys(illnessCounts[illness]).sort();
    const series = dates.map(date => `${date}: ${illnessCounts[illness][date]}`).join(', ');
    return `${illness}: ${series}`;
  }).join('\n')}\n\nPredict the top 3 illnesses that will have the highest cases by month-end. Respond in JSON with keys: predictions (array of {illnessName, predictedCases, confidence}), location (string), forecastDate (YYYY-MM-DD).`;

  const text = await callGemini(prompt);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new ApiError(500, "Failed to parse Gemini response");
    parsed = JSON.parse(match[0]);
  }

  const response = new ApiResponse(200, {
    location: {
      state: state || "All",
      district: district || "All"
    },
    predictions: parsed.predictions || [],
    forecastDate: parsed.forecastDate || new Date().toISOString().split('T')[0],
    modelUsed: "gemini",
    details: {
      totalIllnesses: illnessNames.length,
      totalUsers: users.length,
      illnessNames: illnessNames
    }
  }, "Location-wise illness prediction generated successfully");

  res.status(200).json(response);
});

// General illness trend analysis
export const getIllnessTrendAnalysis = asyncHandler(async (req, res) => {
  const { illnessName, state, district, days = 30 } = req.query;

  if (!illnessName) {
    throw new ApiError(400, "illnessName parameter is required");
  }

  const filter = {
    "illnesses.illnessName": illnessName
  };

  if (state) {
    filter.currentState = state;
  }

  if (district) {
    filter["address.district"] = district;
  }

  const users = await User.find(filter).select("illnesses currentState address.district");

  if (!users.length) {
    throw new ApiError(404, `No data available for illness: ${illnessName}`);
  }

  // Extract illness data
  const illnessData = [];
  users.forEach(user => {
    user.illnesses.forEach(illness => {
      if (illness.illnessName === illnessName && illness.diagnosisDate) {
        illnessData.push({
          date: illness.diagnosisDate.toISOString().split('T')[0],
          location: `${user.currentState}${user.address?.district ? `, ${user.address.district}` : ''}`
        });
      }
    });
  });

  // Group by date and count
  const dailyCounts = {};
  illnessData.forEach(item => {
    dailyCounts[item.date] = (dailyCounts[item.date] || 0) + 1;
  });

  const sortedDates = Object.keys(dailyCounts).sort();
  const series = sortedDates.map(date => `${date}: ${dailyCounts[date]}`).join("\n");

  const prompt = `Analyze the trend for ${illnessName} based on daily cases:\n\n${series}\n\nProvide insights on:\n1. Current trend (increasing/decreasing/stable)\n2. Peak periods\n3. Risk factors\n4. Recommendations for prevention\n\nRespond in JSON with keys: trend (string), peakPeriods (array), riskFactors (array), recommendations (array), summary (string).`;

  const text = await callGemini(prompt);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new ApiError(500, "Failed to parse Gemini response");
    parsed = JSON.parse(match[0]);
  }

  const response = new ApiResponse(200, {
    illnessName,
    location: {
      state: state || "All",
      district: district || "All"
    },
    analysis: {
      trend: parsed.trend || "Unknown",
      peakPeriods: parsed.peakPeriods || [],
      riskFactors: parsed.riskFactors || [],
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || ""
    },
    data: {
      totalCases: Object.values(dailyCounts).reduce((sum, count) => sum + count, 0),
      dateRange: {
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1]
      },
      dailyCounts: dailyCounts
    },
    modelUsed: "gemini"
  }, "Illness trend analysis generated successfully");

  res.status(200).json(response);
});
