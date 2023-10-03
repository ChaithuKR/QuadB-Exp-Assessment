const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Authentication Token

function authenticateToken(request, response, next) {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
}

// API 1 => details - GET Request

app.get("/details/:userId", async (request, response) => {
  const { userId } = request.params;
  const getUser = `SELECT * FROM user WHERE user_id = ${userId}`;
  const resultUser = await database.get(getUser);
  response.send(resultUser);
});

// API 2 =>  update - PUT Request

app.put("/users/:userId/", authenticateToken, async (request, response) => {
  const { userId } = request.params;
  const {
    userName,
    emailId,
    userPassword,
    userImage,
    totalOrders,
    createdAt,
    lastLoggedIn,
  } = request.body;
  const updateUserQuery = `
  UPDATE
    user
  SET
    user_name = '${userName}',
    email_id = ${emailId},
    user_password = ${userPassword},
    user_image = ${userImage},
    total_orders = ${totalOrders}, 
    created_at = ${createdAt},
    last_logged_in = ${lastLoggedIn}
  WHERE
    user_id = ${userId};
  `;

  await database.run(updateUserQuery);
  response.send("User Details Updated");
});

// API 3 => get Image of User based on user_id

app.get("image/:userId/", async (request, response) => {
  const { userId } = request.params;
  const getImageOfUser = `SELECT image FROM user WHERE user_id = ${userId}`;
  const resultImage = await database.get(getImageOfUser);
  response.send(resultImage);
});

// API 4 => insert a new user to database - POST Request

app.post("/user/", authenticateToken, async (request, response) => {
  const { stateId, districtName, cases, cured, active, deaths } = request.body;
  const insertUserQuery = `
  INSERT INTO
    user (user_name, email_id, user_password, user_image, total_orders, created_at, last_logged_in)
  VALUES
    (${userName}, '${emailId}', ${userPassword}, ${userImage}, ${totalOrders}, ${createdAt}, ${lastLoggedIn});`;
  await database.run(insertUserQuery);
  response.send("User Successfully Added");
});

//  API 5 => deletes an user from the database given the user_id

app.delete("/user/:userId/", async (request, response) => {
  const { userId } = request.params;
  const deleteUserQuery = `DELETE FROM user WHERE user_id = ${userId}`;
  const result = await database.run(deleteUserQuery);
  response.send("User Successfully deleted");
});
