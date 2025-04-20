import { asyncHandler } from "../utils/asyncHandler.js";
import Request from "../Models/Request.js";
import axios from "axios";

// Existing request controller
const request = asyncHandler(async (req, res, next) => {
  try {
    const {
      method,
      url,
      headers = [],
      params = [],
      body,
      bodyType,
      authType,
      authData = {},
    } = req.body;

    // Prepare headers
    const requestHeaders = {};
    headers
      .filter((header) => header.enabled)
      .forEach((header) => {
        requestHeaders[header.name] = header.value;
      });

    // Add authentication headers
    if (authType === "bearer" && authData.token) {
      requestHeaders["Authorization"] = `Bearer ${authData.token}`;
    } else if (authType === "basic" && authData.username && authData.password) {
      requestHeaders["Authorization"] = `Basic ${Buffer.from(
        `${authData.username}:${authData.password}`
      ).toString("base64")}`;
    }

    // Prepare query parameters
    const requestParams = {};
    params
      .filter((param) => param.enabled)
      .forEach((param) => {
        requestParams[param.name] = param.value;
      });

    // Prepare request data based on bodyType
    let requestData;
    if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      switch (bodyType) {
        case "form-data":
          requestData = body;
          delete requestHeaders["Content-Type"];
          break;
        case "x-www-form-urlencoded":
          requestData = new URLSearchParams();
          body.forEach((field) => {
            requestData.append(field.key, field.value);
          });
          requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
          break;
        case "raw":
          requestData = body;
          break;
        case "GraphQL":
          requestData = body;
          requestHeaders["Content-Type"] = "application/json";
          break;
        case "binary":
          requestData = body;
          requestHeaders["Content-Type"] = "application/octet-stream";
          break;
        default:
          requestData = undefined;
      }
    }

    // Axios configuration
    const config = {
      method: method.toUpperCase(),
      url,
      headers: requestHeaders,
      params: requestParams,
      data: requestData,
      timeout: 30000,
      validateStatus: () => true,
    };

    // Measure response time
    const startTime = Date.now();
    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    // Calculate response size
    const responseBody = response.data;
    const size = Buffer.byteLength(
      typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody)
    );

    // Prepare response
    const responseData = {
      statusCode: response.status,
      statusText: response.statusText,
      responseTime,
      headers: response.headers,
      body:
        typeof responseBody === "string"
          ? responseBody
          : JSON.stringify(responseBody, null, 2),
      size,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Request failed:", error);

    const errorResponse = {
      statusCode: error.response?.status || 500,
      statusText: error.response?.statusText || "Internal Server Error",
      responseTime: 0,
      headers: error.response?.headers || {},
      body: error.message || "Request failed",
      size: 0,
    };

    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// New getRequests controller
const getRequests = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  const userId = req.user._id;

  const query = { createdBy: userId };
  if (workspaceId) {
    query.workspace = workspaceId;
  }

  const requests = await Request.find(query);

  return res.status(200).json({
    success: true,
    data: requests,
  });
});

export { request, getRequests };