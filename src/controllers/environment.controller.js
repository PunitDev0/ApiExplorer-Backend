// controllers/environment.js
import Environment from "../Models/Environment.js";
import User from "../Models/User.js";

// Get all environments
export const getEnvironments = async (req, res) => {
  try {
    const environments = await Environment.find({ user: req.user._id });
    return res.status(200).json(environments);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new environment
export const createEnvironment = async (req, res) => {
  try {
    const { name, variables } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Environment name is required" });
    }

    // Validate variables array
    const validVariables = Array.isArray(variables)
      ? variables.filter((v) => typeof v.key === "string" && typeof v.value === "string")
      : [];

    const environment = new Environment({
      name: name.trim(),
      variables: validVariables,
      user: req.user._id,
    });
    await environment.save();

    // Add to user's environments array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { environments: environment._id },
    });

    return res.status(201).json(environment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Environment name already exists" });
    }
    return res.status(400).json({ message: error.message || "Invalid data" });
  }
};

// Update environment variables
export const updateEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;
    console.log(req.body,id);
    
    // Validate variables array
    const validVariables = Array.isArray(variables)
      ? variables.filter((v) => typeof v.key === "string" && typeof v.value === "string")
      : [];

    const environment = await Environment.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { variables: validVariables },
      { new: true }
    );

    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    return res.status(200).json(environment);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Invalid data" });
  }
};

// Delete environment
export const deleteEnvironment = async (req, res) => {
  try {
    const { id } = req.params;

    const environment = await Environment.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    // Remove from user's environments array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { environments: id },
    });

    return res.status(200).json({ message: "Environment deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};