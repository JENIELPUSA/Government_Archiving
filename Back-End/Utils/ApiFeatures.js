// ApiFeatures.js
const mongoose = require('mongoose');  // Ensure mongoose is imported
class Apifeatures {
  constructor(query, queryString) {
    this.query = query; // The query from the model (e.g., tools.find())
    this.queryString = queryString; // The query parameters from the request
  }

  filter() {
    const queryObj = { ...this.queryString }; // Extract query parameters
    const excludedFields = ['sort', 'page', 'limit']; // Fields to exclude
    excludedFields.forEach((el) => delete queryObj[el]); // Remove excluded fields
    
    // Check if 'equipmentId' is present in the query string
    if (queryObj.equipmentId) {
      // Use MongoDB's ObjectId format to ensure it matches the equipment's _id
       queryObj['Equipments'] = new mongoose.Types.ObjectId(queryObj.equipmentId); 
      delete queryObj.equipmentId; // Remove the equipmentId from the query string
    }else if(queryObj.Equipments){
      queryObj['Equipments'] = new mongoose.Types.ObjectId(queryObj.Equipments); 
    }

    // Dynamically build the filter query
    this.query = this.query.find(queryObj);
  
    return this;
  }
  // Sorting logic
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy); // Apply sorting to the query
    } else {
      this.query = this.query.sort("-createdAt"); // Default sorting (e.g., by createdAt)
    }
    return this; // Returning `this` for method chaining
  }

  // Limiting the fields returned
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields); // Apply field selection
    } else {
      this.query = this.query.select("-__v"); // Exclude the '__v' field by default
    }
    return this; // Returning `this` for method chaining
  }

  // Pagination logic
  paginate() {
    const page = this.queryString.page * 1 || 1; // Default to page 1
    const limit = this.queryString.limit * 1 || 100; // Default to limit of 100
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit); // Apply pagination
    return this; // Returning `this` for method chaining
  }
}

module.exports = Apifeatures;
