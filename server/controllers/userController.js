import User from "../models/db/user-model.js";
import { catchAsync } from "../utils/catchAsync.js";

import { appError } from "../utils/appError.js"; // Correct the import from AppError

const filterObj = (obj, ...allowedFields) => {
  console.log("the allowed fields", allowedFields);
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  console.log("new filtered object = ", newObj);
  return newObj;
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = catchAsync(async (req, res, next) => {
  let query = User.findById(req.params.id, { role: 0 });

  const doc = await query;

  if (!doc) {
    return next(new appError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError(
        "this route is not for password updates. please use /updateMyPassword.",
        400
      )
    );
  }
  //2)filter unwanted fields .
  const filteredBody = filterObj(req.body, "name", "email");
  //3) update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  try {
    console.log(req.user.id);
    // Attempt to find and delete the user by ID
    const doc = await User.findByIdAndDelete(req.user.id);

    // If no user document is found, return an error
    if (!doc) {
      return next(new appError("No document found with that ID", 404));
    }

    // Respond with success status code and no content
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    // Catch any unexpected errors and pass them to the error handling middleware
    console.error("Error during deletion:", error);
    return next(error);
  }
});

export const getUserByAdmin = catchAsync(async (req, res, next) => {
  let query = User.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new appError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
export const updateUserbyAdmin = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new appError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
export const deleteUserByAdmin = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new appError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
