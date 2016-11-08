/**
 *
 */
import { compile as compileSchema } from 'joi';
import { MongoClient, ObjectID } from 'mongodb';
import {
  validate,
  count,
  aggregate,
  find,
  distinct,
  findOne,
  findOneAndReplace,
  findOneAndUpdate,
  findOneAndDelete,
  findById,
  findByIdAndReplace,
  findByIdAndUpdate,
  findByIdAndDelete,
  insertOne,
  insertMany,
  updateOne,
  updateMany,
  replaceOne,
  deleteOne,
  deleteMany,
  paginate,
} from './methods';

/**
 *
 */
const DEFAULT_TOKEN = Symbol('default connection');
const CACHE = new Map();

/**
 *
 */
export function connect(uri, options = {}) {
  return MongoClient.connect(uri, options).then(db => {
    const token = CACHE.size ? Symbol(uri) : DEFAULT_TOKEN;

    CACHE.set(token, {
      db,
      IDType: ObjectID,
      models: {},
    });

    return { db, token };
  });
}

/**
 *
 */
export function disconnect(token = DEFAULT_TOKEN) {
  return CACHE.get(token).db.close();
}

/**
 *
 */
export function getDatabase(token = DEFAULT_TOKEN) {
  return CACHE.get(token).db;
}

/**
 *
 */
export function setIdType(type, token = DEFAULT_TOKEN) {
  CACHE.get(token).IDType = type;
}

/**
 *
 */
export function getModels(token = DEFAULT_TOKEN) {
  return CACHE.get(token).models;
}

/**
 *
 */
export function createModel(collectionName, maybeSchema = {}, token = DEFAULT_TOKEN) {
  const schema = compileSchema(maybeSchema);
  const cache = CACHE.get(token);

  const model = {
    schema,
    validate: (...args) => validate(schema, ...args),
    count: (...args) => count(cache, collectionName, ...args),
    aggregate: (...args) => aggregate(cache, collectionName, ...args),
    find: (...args) => find(cache, collectionName, ...args),
    distinct: (...args) => distinct(cache, collectionName, ...args),
    findOne: (...args) => findOne(cache, collectionName, ...args),
    findOneAndReplace: (...args) => findOneAndReplace(cache, collectionName, ...args),
    findOneAndUpdate: (...args) => findOneAndUpdate(cache, collectionName, ...args),
    findOneAndDelete: (...args) => findOneAndDelete(cache, collectionName, ...args),
    findById: (...args) => findById(cache, collectionName, ...args),
    findByIdAndReplace: (...args) => findByIdAndReplace(cache, collectionName, ...args),
    findByIdAndUpdate: (...args) => findByIdAndUpdate(cache, collectionName, ...args),
    findByIdAndDelete: (...args) => findByIdAndDelete(cache, collectionName, ...args),
    insertOne: (...args) => insertOne(cache, collectionName, ...args),
    insertMany: (...args) => insertMany(cache, collectionName, ...args),
    updateOne: (...args) => updateOne(cache, collectionName, ...args),
    updateMany: (...args) => updateMany(cache, collectionName, ...args),
    replaceOne: (...args) => replaceOne(cache, collectionName, ...args),
    deleteOne: (...args) => deleteOne(cache, collectionName, ...args),
    deleteMany: (...args) => deleteMany(cache, collectionName, ...args),
    paginate: (...args) => paginate(cache, collectionName, ...args),
  };

  cache.models[collectionName] = model;

  return model;
}
