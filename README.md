# CCL Lab 5 – Assignment 2: DynamoDB CRUD Application

A Node.js and Express CRUD application deployed on an AWS EC2 instance and connected to Amazon DynamoDB.

## Architecture

```text
Client
  |
  v
AWS EC2 (Ubuntu 24.04)
  |
  v
Node.js + Express
  |
  v
AWS SDK for JavaScript
  |
  v
EC2 IAM Role
  |
  v
Amazon DynamoDB
```

## AWS Configuration

- **EC2:** Ubuntu 24.04
- **Region:** eu-north-1
- **Application:** Node.js + Express
- **Database:** Amazon DynamoDB
- **Table:** student-records
- **Partition Key:** studentId (String)
- **Capacity Mode:** On-demand
- **Process Management:** systemd

## Student Data Model

Each student record contains:

```json
{
  "studentId": "STU003",
  "name": "Deon Evidence",
  "age": 20,
  "active": true,
  "skills": ["C++", "AWS", "DynamoDB"],
  "profile": {
    "course": "Computer Engineering",
    "semester": 5
  }
}
```

The application demonstrates the following DynamoDB data types:

| Attribute | Type |
|-----------|------|
| studentId | String |
| name | String |
| age | Number |
| active | Boolean |
| skills | List |
| profile | Map |

## CRUD API

### Create
`POST /students`
Creates a new student record using DynamoDB PutItem.

### Read
`GET /students/:id`
Retrieves a student using the partition key.

`GET /students`
Retrieves all student records.

### Update
`PUT /students/:id`
Updates student information using DynamoDB UpdateItem.

### Delete
`DELETE /students/:id`
Deletes a student using DynamoDB DeleteItem.

## Database Integration

The application uses the AWS SDK for JavaScript with a reusable DynamoDB client.

It also includes:
- Input validation
- Error handling
- Conditional DynamoDB operations
- Duplicate student ID protection
- Checks for existing records before update/delete operations

The studentId partition key allows individual records to be accessed directly without scanning the table.

## Security

The EC2 instance uses the IAM role:
`EC2-DynamoDB-Lab5-Role`

AWS credentials are not hardcoded in the application. The AWS SDK obtains temporary credentials through the EC2 instance role.

The IAM policy is restricted to the student-records DynamoDB table and the operations required by the application.

## Running the Application

Install dependencies:
```bash
npm install
```

Start the application:
```bash
node server.js
```

The application runs on port 3000.

For persistent execution, the application is managed using:
`lab5-dynamodb.service`

## Project Structure

```
CCL-Lab5-Assignment2-DynamoDB/
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```
