import { Schema } from 'mongoose';

const ParameterSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Parameter name is required'], 
    trim: true 
  },
  value: { 
    type: String, 
    required: [true, 'Parameter value is required'], 
    trim: true 
  },
  enabled: { 
    type: Boolean, 
    default: true 
  }
});

export default ParameterSchema;