import { Schema, model } from 'mongoose';
import HeaderSchema from './schemas/HeaderSchema.js';
import ParameterSchema from './schemas/ParameterSchema.js';
import BodyFieldSchema from './schemas/BodyFieldSchema.js';
import AuthDataSchema from './schemas/AuthDataSchema.js';

const RequestSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Request name is required'], 
    trim: true 
  },
  method: { 
    type: String, 
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    required: [true, 'Request method is required'],
    default: 'GET'
  },
  url: { 
    type: String, 
    required: [true, 'Request URL is required'], 
    trim: true 
  },
  headers: [HeaderSchema],
  params: [ParameterSchema],
  bodyType: { 
    type: String, 
    enum: ['raw', 'form-data', 'x-www-form-urlencoded', 'binary', 'GraphQL', 'none'],
    default: 'raw'
  },
  body: { 
    type: String, 
    default: '' 
  },
  formData: [BodyFieldSchema],
  rawType: { 
    type: String, 
    enum: ['JSON', 'Text', 'JavaScript', 'HTML', 'XML'],
    default: 'JSON'
  },
  authType: { 
    type: String, 
    enum: ['none', 'bearer', 'basic'],
    default: 'none'
  },
  authData: AuthDataSchema,
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
  collection: { // Added optional collection reference
    type: Schema.Types.ObjectId,
    ref: 'Collection',
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
RequestSchema.index({ createdBy: 1, workspace: 1 });

const Request = model('Request', RequestSchema);
export default Request;