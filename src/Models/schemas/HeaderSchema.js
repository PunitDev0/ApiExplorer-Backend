import { Schema } from 'mongoose';

const HeaderSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Header name is required'], 
    trim: true 
  },
  value: { 
    type: String, 
    required: [true, 'Header value is required'], 
    trim: true 
  },
  enabled: { 
    type: Boolean, 
    default: true 
  }
});

export default HeaderSchema;