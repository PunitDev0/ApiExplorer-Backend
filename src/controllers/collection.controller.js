import { asyncHandler } from "../utils/asyncHandler.js";
import Collection from "../Models/Collection.js";
import Workspace from "../Models/Workspace.js";
import User from "../Models/User.js";
import Request from "../Models/Request.js";

export const createCollection = asyncHandler(async (req, res) => {
  const { name, workspaceId } = req.body;
  const userId = req.user._id;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Collection name is required and must be a non-empty string",
    });
  }

  if (workspaceId) {
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": userId,
    });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or you don't have access",
      });
    }
  }

  const collection = new Collection({
    name: name.trim(),
    createdBy: userId,
    workspace: workspaceId || null,
    requests: [],
  });

  const savedCollection = await collection.save();

  if (workspaceId) {
    await Workspace.findByIdAndUpdate(
      workspaceId,
      { $push: { collections: savedCollection._id } },
      { new: true }
    );
  }

  await User.findByIdAndUpdate(
    userId,
    { $push: { collections: savedCollection._id } },
    { new: true }
  );

  return res.status(201).json({
    success: true,
    message: "Collection created successfully",
    data: {
      id: savedCollection._id,
      name: savedCollection.name,
      workspace: savedCollection.workspace,
      createdBy: savedCollection.createdBy,
      requests: savedCollection.requests,
    },
  });
});

export const getCollections = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  const userId = req.user._id;

  const query = { createdBy: userId };
  if (workspaceId) {
    query.workspace = workspaceId;
  }

  const collections = await Collection.find(query).populate("requests");

  return res.status(200).json({
    success: true,
    data: collections,
  });
});

export const updateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user._id;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Collection name is required and must be a non-empty string",
    });
  }

  const collection = await Collection.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!collection) {
    return res.status(404).json({
      success: false,
      message: "Collection not found or you don't have access",
    });
  }

  collection.name = name.trim();
  const updatedCollection = await collection.save();

  return res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    data: {
      id: updatedCollection._id,
      name: updatedCollection.name,
    },
  });
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const collection = await Collection.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!collection) {
    return res.status(404).json({
      success: false,
      message: "Collection not found or you don't have access",
    });
  }

  if (collection.workspace) {
    await Workspace.findByIdAndUpdate(
      collection.workspace,
      { $pull: { collections: id } },
      { new: true }
    );
  }

  await User.findByIdAndUpdate(
    userId,
    { $pull: { collections: id } },
    { new: true }
  );

  await Collection.deleteOne({ _id: id });

  return res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
  });
});

export const addRequestToCollection = asyncHandler(async (req, res) => {
  console.log(req.body.request);
  
  const { collectionId, request } = req.body;
  const userId = req.user._id;

  if (!collectionId || !request) {
    return res.status(400).json({
      success: false,
      message: "Collection ID and request data are required",
    });
  }

  const collection = await Collection.findOne({
    _id: collectionId,
    createdBy: userId,
  });

  if (!collection) {
    return res.status(404).json({
      success: false,
      message: "Collection not found or you don't have access",
    });
  }

  const newRequest = new Request({
    ...request,
    createdBy: userId,
    workspace: collection.workspace || null,
    collection: collectionId,
  });

  const savedRequest = await newRequest.save();

  collection.requests.push(savedRequest._id);
  await collection.save();

  return res.status(200).json({
    success: true,
    message: "Request added to collection successfully",
    data: {
      _id: savedRequest._id,
      name: savedRequest.name,
      method: savedRequest.method,
      url: savedRequest.url,
      headers: savedRequest.headers || [],
      params: savedRequest.params || [],
      bodyType: savedRequest.bodyType || "none",
      body: savedRequest.body || "",
      rawType: savedRequest.rawType || "Text",
      authType: savedRequest.authType || "none",
      authData: savedRequest.authData || {},
    },
  });
});