// routes/workspace.routes.js
import { Router } from "express";
import { createWorkspace, validateWorkspaceInput } from "../controllers/workspace.controller.js";
import Workspace from '../Models/Workspace.js'; // Adjust path as per your project structure

const router = Router();

// Create a new workspace
router.route('/workspaces')
    .post(validateWorkspaceInput, createWorkspace);

// Get all workspaces
router.route('/workspaces')
    .get(async (req, res) => {
        try {
            const workspaces = await Workspace.find()
                .select('name owner createdAt')
                .populate('owner', 'name email');

            return res.status(200).json({
                success: true,
                data: workspaces
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch workspaces",
                error: error.message
            });
        }
    });

// Get a specific workspace by ID
router.route('/workspaces/:id')
    .get(async (req, res) => {
        try {
            const workspace = await Workspace.findById(req.params.id)
                .populate('owner', 'name email')
                .populate('members.user', 'name email');

            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    message: "Workspace not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: workspace
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch workspace",
                error: error.message
            });
        }
    });

export default router;