import { Schema, model } from "mongoose";
import validator from "validator";
const { isEmail } = validator;
import { hash, compare } from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordConfirm: {
      type: String,
      required: true,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Password are not the same ! ",
      },
    },
    passwordChangedat: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    email: {
      type: String,
      required: true,
      validate: {
        validator: isEmail,
        message: "Email is invalid",
      },
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: String,
    },
    nameChangedCredit: {
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 12);
  console.log(this.password);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await compare(candidatePassword, userPassword);
};
const User = model("User", userSchema);

export default User;
