/**
 *
 */
import { validate as validateSchema } from 'joi';
import { toResult } from './utils';

/**
 *
 */
export function validate(schema, value, options = {}) {
  return new Promise((resolve, reject) =>
    validateSchema(value, schema, options, (error, result) => (error ? reject(error) : resolve(result))),
  );
}

/**
 *
 */
export function count(cache, collectionName, filter, options = {}) {
  return cache.db.collection(collectionName).count(filter, options);
}

/**
 *
 */
export function aggregate(cache, collectionName, pipeline, options = {}) {
  return cache.db.collection(collectionName).aggregate(pipeline, options).map(toResult);
}

/**
 *
 */
export function find(cache, collectionName, filter, options = {}) {
  return cache.db.collection(collectionName).find(filter, options).toArray().map(toResult);
}

/**
 *
 */
export function distinct(cache, collectionName, key, filter, options = {}) {
  return cache.db.collection(collectionName).distinct(key, filter, options).then(toResult);
}

/**
 *
 */
export function findOne(cache, collectionName, filter, options = {}) {
  return cache.db.collection(collectionName).findOne(filter, options).then(toResult);
}

/**
 *
 */
export function findOneAndReplace(cache, collectionName, filter, doc, options = {}) {
  return cache.db.collection(collectionName).findOneAndReplace(filter, doc, {
    returnOriginal: false,
    ...options,
  }).then(toResult);
}

/**
 *
 */
export function findOneAndUpdate(cache, collectionName, filter, updateOp, options = {}) {
  return cache.db.collection(collectionName).findOneAndUpdate(filter, updateOp, {
    returnOriginal: false,
    ...options,
  }).then(toResult);
}

/**
 *
 */
export function findOneAndDelete(cache, collectionName, filter, options = {}) {
  return cache.db.collection(collectionName).findOneAndDelete(filter, options).then(toResult);
}

/**
 *
 */
export function findById(cache, collectionName, id, options = {}) {
  return cache.db.collection(collectionName).findOne({ _id: new cache.IDType(id) }, options).then(toResult);
}

/**
 *
 */
export function findByIdAndReplace(cache, collectionName, id, doc, options = {}) {
  return cache.db.collection(collectionName).findOneAndReplace({ _id: new cache.IDType(id) }, doc, {
    returnOriginal: false,
    ...options,
  }).then(toResult);
}

/**
 *
 */
export function findByIdAndUpdate(cache, collectionName, id, operation, options = {}) {
  return cache.db.collection(collectionName).findOneAndUpdate({ _id: new cache.IDType(id) }, operation, {
    returnOriginal: false,
    ...options,
  }).then(toResult);
}

/**
 *
 */
export function findByIdAndDelete(cache, collectionName, id, options = {}) {
  return cache.db.collection(collectionName).findOneAndDelete({ _id: new cache.IDType(id) }, options).then(toResult);
}

/**
 *
 */
export function insertMany(cache, collectionName, docs, options = {}) {
  return cache.db.collection(collectionName).insertMany(docs, options).then(toResult);
}

/**
 *
 */
export function insertOne(cache, collectionName, doc, options = {}) {
  return cache.db.collection(collectionName).insertOne(doc, options).then(toResult);
}

/**
 *
 */
export function updateMany(cache, collectionName, filter, operation, options = {}) {
  return cache.db.collection(collectionName).updateMany(filter, operation, options).then(result => result.modifiedCount);
}

/**
 *
 */
export function updateOne(cache, collectionName, filter, operation, options = {}) {
  return cache.db.collection(collectionName).updateOne(filter, operation, options).then(result => result.modifiedCount);
}

/**
 *
 */
export function replaceOne(cache, collectionName, filter, doc, options = {}) {
  return cache.db.collection(collectionName).replaceOne(filter, doc, options).then(result => result.modifiedCount);
}

/**
 *
 */
export function deleteOne(cache, collectionName, filter, options = {}) {
  return cache.db.collection(collectionName).deleteOne(filter, options).then(result => result.deletedCount);
}

/**
 *
 */
export function deleteMany(cache, collectionName, filter, options = {}) {
  return cache.db.collection(collectionName).deleteMany(filter, options).then(result => result.deletedCount);
}

/**
 *
 */
export function paginate(cache, collectionName, filter, page = 1, options = {}) {
  const { limit = 50, sort = {}, fields = {} } = options;
  const output = {
    data: undefined,
    pages: {
      current: page,
      prev: 0,
      hasPrev: false,
      next: 0,
      hasNext: false,
      total: 0,
    },
    items: {
      limit,
      begin: ((page * limit) - limit) + 1,
      end: page * limit,
      total: 0,
    },
  };

  return Promise.all(
    [
      count(collectionName, filter),
      find(collectionName, filter, { limit, sort, fields, skip: (page - 1) * limit }),
    ],
  ).then(([total, data]) => {
    output.items.total = total;
    output.data = data;
    output.pages.total = Math.ceil(output.items.total / limit);
    output.pages.next = output.pages.current + 1;
    output.pages.hasNext = output.pages.next <= output.pages.total;
    output.pages.prev = output.pages.current - 1;
    output.pages.hasPrev = output.pages.prev !== 0;

    if (output.items.begin > output.items.total) {
      output.items.begin = output.items.total;
    }
    if (output.items.end > output.items.total) {
      output.items.end = output.items.total;
    }

    return output;
  });
}
