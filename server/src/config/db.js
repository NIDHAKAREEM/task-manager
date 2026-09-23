const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/taskmanager');
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;

// MongoDB is a NoSQL database that stores data in JSON-like documents instead of tables.

// SQL	MongoDB
// Tables	Collections
// Rows	Documents
// Columns	Fields

// WHY WE DEFINE SCHEMA
// 1. Data Validation: Ensures that the data stored in the database is valid and consistent.
// 2. Structure: Provides a clear structure for the data, making it easier to understand and work with.
// 3. Indexing: Allows for efficient indexing and querying of the data.
// 4. Documentation: Serves as a form of documentation for the data model.
// 5. Relationships: Defines relationships between different data models (Each task references a user using ObjectId, enabling user-specific data retrieval).