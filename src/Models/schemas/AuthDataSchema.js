import { Schema } from 'mongoose';

const AuthDataSchema = new Schema({
  token: { 
    type: String, 
    trim: true 
  },
  username: { 
    type: String, 
    trim: true 
  },
  password: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

export default AuthDataSchema;