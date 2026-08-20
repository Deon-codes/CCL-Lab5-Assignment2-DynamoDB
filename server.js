const express = require("express");
const {
  DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const app = express();

const PORT = 3000;
const TABLE_NAME = "student-records";
const REGION = "eu-north-1";

app.use(express.json());

/*
 * Reusable DynamoDB client.
 * AWS credentials are obtained from the EC2 IAM role.
 * No access keys are stored in the application.
 */
const client = new DynamoDBClient({
  region: REGION
});

const db = DynamoDBDocumentClient.from(client);

/* -------------------------
   Input validation
------------------------- */

function validateStudent(body) {
  const errors = [];

  if (!body.studentId || typeof body.studentId !== "string") {
    errors.push("studentId must be a non-empty string");
  }

  if (!body.name || typeof body.name !== "string") {
    errors.push("name must be a non-empty string");
  }

  const age = Number(body.age);

  if (!Number.isInteger(age) || age < 1 || age > 120) {
    errors.push("age must be an integer between 1 and 120");
  }

  if (typeof body.active !== "boolean") {
    errors.push("active must be a boolean");
  }

  if (!Array.isArray(body.skills)) {
    errors.push("skills must be an array");
  }

  if (
    body.profile === null ||
    typeof body.profile !== "object" ||
    Array.isArray(body.profile)
  ) {
    errors.push("profile must be an object");
  }

  return errors;
}

/* -------------------------
   Home
------------------------- */

app.get("/", (req, res) => {
  res.send(`
    <h1>Lab 5 - DynamoDB CRUD Application</h1>
    <p>Student Records API</p>
    <p>Database: DynamoDB</p>
  `);
});

/* -------------------------
   CREATE
------------------------- */

app.post("/students", async (req, res) => {
  try {
    const errors = validateStudent(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    const item = {
      studentId: req.body.studentId.trim(),
      name: req.body.name.trim(),
      age: Number(req.body.age),
      active: req.body.active,
      skills: req.body.skills,
      profile: req.body.profile
    };

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_not_exists(studentId)"
      })
    );

    res.status(201).json({
      message: "Student created successfully",
      item
    });
  } catch (error) {
    console.error("CREATE error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return res.status(409).json({
        error: "Student with this studentId already exists"
      });
    }

    res.status(500).json({
      error: "Failed to create student"
    });
  }
});

/* -------------------------
   READ ONE
------------------------- */

app.get("/students/:id", async (req, res) => {
  try {
    const result = await db.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          studentId: req.params.id
        }
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(result.Item);
  } catch (error) {
    console.error("READ error:", error);

    res.status(500).json({
      error: "Failed to read student"
    });
  }
});

/* -------------------------
   READ ALL
------------------------- */

app.get("/students", async (req, res) => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    );

    res.json(result.Items || []);
  } catch (error) {
    console.error("READ ALL error:", error);

    res.status(500).json({
      error: "Failed to read students"
    });
  }
});

/* -------------------------
   UPDATE
------------------------- */

app.put("/students/:id", async (req, res) => {
  try {
    const errors = validateStudent({
      ...req.body,
      studentId: req.params.id
    });

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    const result = await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,

        Key: {
          studentId: req.params.id
        },

        UpdateExpression:
          "SET #name = :name, age = :age, active = :active, skills = :skills, profile = :profile",

        ExpressionAttributeNames: {
          "#name": "name"
        },

        ExpressionAttributeValues: {
          ":name": req.body.name.trim(),
          ":age": Number(req.body.age),
          ":active": req.body.active,
          ":skills": req.body.skills,
          ":profile": req.body.profile
        },

        ConditionExpression: "attribute_exists(studentId)",

        ReturnValues: "ALL_NEW"
      })
    );

    res.json({
      message: "Student updated successfully",
      item: result.Attributes
    });
  } catch (error) {
    console.error("UPDATE error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.status(500).json({
      error: "Failed to update student"
    });
  }
});

/* -------------------------
   DELETE
------------------------- */

app.delete("/students/:id", async (req, res) => {
  try {
    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,

        Key: {
          studentId: req.params.id
        },

        ConditionExpression: "attribute_exists(studentId)"
      })
    );

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("DELETE error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.status(500).json({
      error: "Failed to delete student"
    });
  }
});

/* -------------------------
   Start application
------------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `DynamoDB CRUD app running on port ${PORT}`
  );
});
