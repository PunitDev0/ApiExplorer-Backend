import { Schema } from 'mongoose';

const BodyFieldSchema = new Schema({
  key: { 
    type: String, 
    required: [true, 'Body field key is required'], 
    trim: true 
  },
  value: { 
    type: String, 
    default: '' 
  },
  type: { 
    type: String, 
    enum: ['text', 'file'], 
    default: 'text' 
  }
});

export default BodyFieldSchema;