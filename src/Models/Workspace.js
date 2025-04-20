import { Schema, model } from 'mongoose';
import CollectionSchema from './Collection.js';

const WorkspaceSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Workspace name is required'], 
    trim: true,
    index: true 
  },
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Workspace owner is required'] 
  },
  members: [{
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['admin', 'editor', 'viewer'], 
      default: 'viewer' 
    }
  }],
  collections: [{ // Changed to reference instead of embedding
    type: Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

WorkspaceSchema.index({ owner: 1, name: 1 });

const Workspace = model('Workspace', WorkspaceSchema);
export default Workspace;