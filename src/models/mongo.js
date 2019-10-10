'use strict';

const Q = require('@nmq/q/client');

/** Class representing a generic mongo model. */
class Model {

  /**
   * Model Constructor
   * @param schema {object} - mongo schema
   */
  constructor(schema) {
    this.schema = schema;
  }

  /**
   * Retrieves one or more records
   * @param _id {string} optional mongo record id
   * @returns {*}
   */
  get(_id) {
    if (_id) {
      Q.publish('database', 'read', {id: _id});
      return this.schema.findOne({_id: _id});
    } else {
      Q.publish('database', 'read', 'all');
      return this.schema.find({});
    }
  }

  /**
   * Create a new record
   * @param record {object} matches the format of the schema
   * @returns {*}
   */
  post(record) {
    let newRecord = new this.schema(record);
    Q.publish('database', 'create', {record: newRecord.name});
    return newRecord.save();
  }

  /**
   * Replaces a record in the database
   * @param _id {string} Mongo Record ID
   * @param record {object} The record data to replace. ID is a required field
   * @returns {*}
   */
  put(_id, record) {
    Q.publish('database', 'update', {id: _id, record});
    return this.schema.findByIdAndUpdate(_id, record, {new: true});
  }

  /**
   * Deletes a recod in the model
   * @param _id {string} Mongo Record ID
   * @returns {*}
   */
  delete(_id) {
    Q.publish('database', 'delete', {id: _id});
    return this.schema.findByIdAndDelete(_id);
  }

}

module.exports = Model;
