# Lab 5 – Assignment 1: RDS

## Overview

The Lab 4 Joomla application running on Amazon EC2 was connected to an Amazon RDS database.

## Architecture

Internet → EC2 → Apache → Joomla → Amazon RDS

## RDS Configuration

- DB Identifier: college-db
- Engine: MySQL Community
- Instance Class: db.t4g.micro
- Region: eu-north-1
- Database: joomla_db
- Port: 3306

## Joomla Connection

The Joomla application was configured to use the RDS endpoint instead of the local database.

- Database type: mysqli
- Database host: RDS endpoint
- Database: joomla_db
- Table prefix: boshs_

The database password is not included in the repository.

## Database

The RDS database contains the Joomla tables required by the application.

## CRUD

The Joomla application was tested with:

- Create
- Read
- Update
- Delete

All operations were performed through the running EC2-hosted Joomla application.

## Security

The RDS security group allows inbound MySQL traffic on port 3306 only from the EC2 security group.

The database is not exposed through a `0.0.0.0/0` inbound rule.

## Result

The Lab 4 Joomla application successfully operates using the RDS database while running on the EC2 instance.
