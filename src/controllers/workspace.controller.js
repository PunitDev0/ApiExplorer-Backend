// workspaceController.js
import Workspace from '../Models/Workspace.js'; // Adjust path as per your project structure
import User from '../Models/User.js';
// Create a new workspace
export const createWorkspace = async (req, res) => {
    try {
        console.log(req.body);
        
        // Get the workspace name from request body
        const { name, ownerId } = req.body;

        // Check if name is provided
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Workspace name is required and must be a non-empty string'
            });
        }

        // Get the authenticated user from request (assuming you're using some auth middleware)
        const owner = ownerId; // Adjust based on your auth middleware
        console.log(ownerId);
        
        // if (!owner) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'User authentication required'
        //     });
        // }

        // Create new workspace
        const workspace = new Workspace({
            name: name.trim(),
            owner,
            members: [{ user: owner, role: 'admin' }] // Owner is automatically admin
        });

        // Save to database
        const savedWorkspace = await workspace.save();

        // Update user's workspaces array
        await User.findByIdAndUpdate(
            owner,
            { $push: { workspaces: savedWorkspace._id } },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: 'Workspace created successfully',
            data: {
                _id: savedWorkspace._id,
                name: savedWorkspace.name,
                owner: savedWorkspace.owner,
                createdAt: savedWorkspace.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating workspace:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create workspace',
            error: error.message
        });
    }
};

// Optional: Input validation middleware (if not using a validation library like Joi)
export const validateWorkspaceInput = (req, res, next) => {
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Workspace name is required'
        });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Workspace name must be a non-empty string'
        });
    }

    next();
}; 