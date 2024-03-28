import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../types/type";

// Create the UserSchema using Mongoose Schema, specifying the data types and constraints.
const UserSchema = new Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

// PASSWORD ENCRYPTION MIDDLEWARE FOR MONGODB - BEFORE ANY UPDATES TO DOCUMENT GET SAVED, CHECK IF PASSWORD IS CHANGED. IF YES, THEN ENCRYPT IT AND THEN CALL NEXT FUNCTION. DEFINING PASSWORD ENCRYPTION LOGIC HERE HELPS TO OPTIMIZE THE USER REGISTRATION CONTROLLER
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Create and export the User model using Mongoose, specifying the type as UserType.
export default model<UserType>("User", UserSchema);
