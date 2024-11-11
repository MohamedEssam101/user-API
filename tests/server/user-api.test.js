import request from "supertest";

import { server, connectToDB, closeDBConnection } from "../../server/server.js";

beforeAll(async () => {
  await connectToDB(); // Connect to the database before tests
});

afterAll(async () => {
  server.close();
  await closeDBConnection(); // Close the database connection after tests
});

//handle duplication
describe("POST /signUp", () => {
  it("should return 201 and the created user", async () => {
    const res = await request(server).post("/api/users/signup").send({
      name: "ahmed",
      email: "ahmed@gmail.com",
      password: "Testing",
      passwordConfirm: "Testing",
    });
    // Assert that the response status is 201 (created)
    expect(res.status).toBe(201);
    expect(res.body.data.user).toHaveProperty("name", "ahmed");
    expect(res.body.data.user).toHaveProperty("email", "ahmed@gmail.com");
  });
});

describe("POST /login", () => {
  it("should return 200 and a token if login is successful", async () => {
    jest.setTimeout(10000); // Increase timeout to 10 seconds

    const res = await request(server)
      .post("/api/users/login")
      .send({ email: "ahmed@gmail.com", password: "Testing" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token"); // Assuming token is returned in the response
  });

  it("should return 400 if email or password is missing", async () => {
    const res = await request(server)
      .post("/api/users/login")
      .send({
        email: "ahmed@gmail.com", // No password
      })
      .expect(400);

    // Assert the error response
    expect(res.body.message).toBe("Please provide email and password");
  });
  it("should return 401 if password is incorrect", async () => {
    const res = await request(server)
      .post("/api/users/login")
      .send({
        email: "ahmed@gmail.com",
        password: "WrongPassword", // Incorrect password
      })
      .expect(401);

    // Assert the error response
    expect(res.body.message).toBe("incorrect email or password");
  });
});

describe("POST /updatePassword", () => {
  it("should return 200 if the password update is successful", async () => {
    const loginResponse = await request(server)
      .post("/api/users/login")
      .send({ email: "ahmed@gmail.com", password: "Testing" });
    const token = loginResponse.body.token; // Get the token from the login response

    const response = await request(server)
      .patch("/api/users/updatePassword") // Your password update route
      .set("Authorization", `Bearer ${token}`) // Set Authorization header with the token
      .send({
        currentPassword: "Testing", // The current password
        newPassword: "ahmed123", // The new password
        NewPasswordConfirm: "ahmed123", // Confirm the new password
      });

    expect(response.status).toBe(200); // Expect a successful response
  });
  it("should return 401 if the current password is incorrect", async () => {
    // First, login to get the token
    const loginResponse = await request(server)
      .post("/api/users/login") // Use the login route
      .send({
        email: "ahmed@gmail.com",
        password: "ahmed123",
      });

    const token = loginResponse.body.token; // Get the token from the login response

    // Now make the request to update the password with incorrect current password
    const response = await request(server)
      .patch("/api/users/updatePassword") // Use PATCH method instead of POST
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "wrongPassword", // Incorrect password
        newPassword: "ahmed123",
        NewPasswordConfirm: "ahmed123",
      });

    expect(response.status).toBe(401); // Expect Unauthorized error for incorrect password
    expect(response.body.message).toBe("Your current password is wrong.");
  });
});

describe("GET /me", () => {
  let token; // to store the token after login

  it("should return 200 and the user data if user is authenticated", async () => {
    // Step 1: Log in to get the token
    const loginResponse = await request(server)
      .post("/api/users/login") // Adjust endpoint as needed
      .send({
        email: "ahmed@gmail.com",
        password: "ahmed123",
      });

    expect(loginResponse.status).toBe(200); // Ensure the login was successful
    token = loginResponse.body.token; // Store the token from the login response

    // Step 2: Use the token to get user info
    const response = await request(server)
      .get("/api/users/me") // Adjust endpoint if needed
      .set("Authorization", `Bearer ${token}`); // Set the authorization header with the token

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.data).toHaveProperty("_id"); // Expect the user object to have an _id property
    expect(response.body.data.data.email).toBe("ahmed@gmail.com"); // Ensure the email is correct
  });

  it("should return 401 if the token is invalid", async () => {
    // Simulate an invalid token
    const invalidToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MzA4ZDgzNDgzMGI3ZmI3YmZjYjQyZiIsImlhdCI6MTczMTIzNTIwNCwiZXhwIjoxNzMyNTMxMjA0fQ.x7IXCs-F9H1GMBj-htxSNu4uiIe8M5kn9vvLzLGw0mw";
    const response = await request(server)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${invalidToken}`); // Use the invalid token

    expect(response.status).toBe(401); // Expect Unauthorized status
    // if i set the same token and removed some letter the message will be (Invalid Token)
    expect(response.body.message).toBe(
      "User belongs to this token no longer exists"
    ); // Customize as per actual error message
  });
});

describe("PATCH /updateMe", () => {
  it("should update the name successfully", async () => {
    // 1. Log in to get the token
    const loginResponse = await request(server).post("/api/users/login").send({
      email: "ahmed@gmail.com", // Replace with an actual user's email
      password: "ahmed123", // Replace with the correct password
    });

    // Extract the token and user ID from the login response
    const token = loginResponse.body.token;

    // 2. Send a PATCH request to update the name
    const response = await request(server)
      .patch("/api/users/updateMe")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "updated Name", // Only the name is updated
      });

    // 3. Validate the response
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.user.name).toBe("updated Name");
    expect(response.body.data.user.email).toBe("ahmed@gmail.com"); // Ensure email is not changed
  });

  // Additional tests can go here if needed
});

describe("DELETE /deleteMe", () => {
  it("should return 204 and null if user is deleted", async () => {
    // First, login to get the token
    const loginRes = await request(server).post("/api/users/login").send({
      email: "ahmed@gmail.com",
      password: "ahmed123",
    });

    const token = loginRes.body.token; // Get the token from the login response

    // Now, send the delete request with the token
    const res = await request(server)
      .delete("/api/users/deleteMe")
      .set("Authorization", `Bearer ${token}`); // Set Authorization header with the token

    // Assert the status code and the response
    console.log(res.status);
    expect(res.status).toBe(204); // Ensure it returns a 204 status
    expect(res.body).toEqual({}); // Explicitly checks for an empty object
  });

  it("should return 401 if no token is provided", async () => {
    await request(server).get("/api/users/logout");

    const res = await request(server).delete("/api/users/deleteMe");

    // Assert the error response for missing token
    expect(res.status).toBe(401); // 401 because the user is not authenticated
    expect(res.body.message).toBe("You are not logged in ! please login"); // The message should be based on your middleware that checks if the token is missing
  });

  it("should return 404 if the user does not exist", async () => {
    // Simulate a non-existent user by passing an invalid token
    const invalidToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MzFmMGQ0YzA0Y2RiOGUxM2QxZmVlZCIsImlhdCI6MTczMTMyNjE2NCwiZXhwIjoxNzMyNjIyMTY0fQ.zhXEuy9GEMkrxolOf5GdDuVVPs7wx6W3ojvwOVG2TgI";

    const res = await request(server)
      .delete("/api/users/deleteMe")
      .set("Authorization", `Bearer ${invalidToken}`); // Set Authorization header with invalid token

    // Assert the error response for non-existent user (invalid token)
    expect(res.status).toBe(401); // Assuming the message for non-existent user is returned as "User not found"
    expect(res.body.message).toBe(
      "User belongs to this token no longer exists"
    );
  });
});
describe("PATCH ADMIN /:id", () => {
  it("should return 200 and the updated user if the update is successful", async () => {
    const loginRes = await request(server).post("/api/users/login").send({
      email: "admin@gmail.com", // admin email
      password: "admin", // admin password
    });

    const token = loginRes.body.token; // Get the token from the login response

    const userIdToUpdate = "673210a2b06aa6f25a67e07c";
    const res = await request(server)
      .patch(`/api/users/${userIdToUpdate}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated User Name",
        email: "updatedemail@example.com",
      });

    // Assert the status code
    expect(res.status).toBe(200);
    // Assert the updated user data is returned
    expect(res.body.status).toBe("success");
    expect(res.body.data.data.name).toBe("Updated User Name");
    expect(res.body.data.data.email).toBe("updatedemail@example.com");
  });

  it("should return 404 if the user is not found", async () => {
    const loginRes = await request(server).post("/api/users/login").send({
      email: "admin@gmail.com", // admin email
      password: "admin", // admin password
    });

    const token = loginRes.body.token; // Get the token from the login response

    const invalidUserId = "673201fe993443a8fd325555"; // Non-existent user ID

    const res = await request(server)
      .get(`/api/users/${invalidUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated User Name", // Example update to name
      });

    // Assert the error response
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No document found with that ID");
  });

  it("should return 400 if invalid data is sent", async () => {
    const loginRes = await request(server).post("/api/users/login").send({
      email: "admin@gmail.com", // admin email
      password: "admin", // admin password
    });

    const token = loginRes.body.token; // Get the token from the login response

    const userIdToUpdate = "67320e1323b501e4c97a61d5"; // Replace with a valid user ID to update

    const res = await request(server)
      .patch(`/api/users/${userIdToUpdate}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "", // Invalid name (empty string)
        email: "invalid-email", // Invalid email format
      });

    // Assert the error response for invalid input
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch("Validation failed");
  });
});

describe("DELETE ADMIN /:id", () => {
  it("should return 204 and null if the user is successfully deleted", async () => {
    const loginRes = await request(server).post("/api/users/login").send({
      email: "admin@gmail.com", // admin email
      password: "admin", // admin password
    });

    const token = loginRes.body.token; // Get the token from the login response

    const userIdToDelete = "673210a2b06aa6f25a67e07c"; // Replace with a valid user ID to delete

    const res = await request(server)
      .delete(`/api/users/${userIdToDelete}`)
      .set("Authorization", `Bearer ${token}`);

    // Assert the status code and response body
    expect(res.status).toBe(204); // No content for successful deletion
    expect(res.body).toEqual({}); // Explicitly checks for an empty object
  });

  it("should return 404 if the user to delete is not found", async () => {
    const loginRes = await request(server).post("/api/users/login").send({
      email: "admin@gmail.com", // admin email
      password: "admin", // admin password
    });

    const token = loginRes.body.token; // Get the token from the login response

    const invalidUserId = "673201fe993443a8fd325555"; // Non-existent user ID

    const res = await request(server)
      .delete(`/api/users/${invalidUserId}`)
      .set("Authorization", `Bearer ${token}`);

    // Assert the error response for non-existent user
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No document found with that ID");
  });

  it("should return 401 if no token is provided", async () => {
    const invalidUserId = "67320e1323b501e4c97a61d5"; // Replace with a valid user ID to delete

    await request(server).get("/api/users/logout");

    const res = await request(server).delete(`/api/users/${invalidUserId}`); // No token

    // Assert the error response for missing token
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch("You are not logged in !");
  });
});
