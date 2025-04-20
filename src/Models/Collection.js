import { Schema, model } from 'mongoose';
import RequestSchema from './Request.js';

const CollectionSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Collection name is required'], 
    trim: true 
  },
  requests: [{
    type: Schema.Types.ObjectId, // Changed to reference instead of embedding
    ref: 'Request'
  }],
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  workspace: { // Added optional workspace reference
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Add index for better query performance
CollectionSchema.index({ createdBy: 1, workspace: 1 });

const Collection = model('Collection', CollectionSchema);
export default Collection;