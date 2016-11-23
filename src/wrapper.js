/**
 *
 */
import { compile as compileSchema, validate as validateSchema } from 'joi';
import { MongoClient, ObjectID } from 'mongodb';
import { toResult } from './utils';

/**
 *
 */
class CollectionMap extends Map {
  set(name, collection) {
    const hasItem = this.has(name);
    super.set(name, collection);

    if (!hasItem && collection.indexes.length) {
      CACHE.db.collection(name).createIndexes(collection.indexes).catch(error => {
        console.error(error);
      });
    }
  }
}

/**
 *
 */
const CACHE = {
  db: null,
  collections: new CollectionMap(),
};

/**
 *
 */
export function connect(uri, options = {}) {
  if (CACHE.db !== null) {
    return Promise.resolve(CACHE.db);
  }

  return MongoClient.connect(uri, options).then(db => {
    CACHE.db = db;
    return db;
  });
}

/**
 *
 */
export function disconnect() {
  if (CACHE.db === null) {
    return Promise.resolve();
  }

  return CACHE.db.close().then(() => {
    CACHE.db = null;
  });
}

/**
 *
 */
export function getDatabase() {
  return CACHE.db;
}

/**
 *
 */
export function getCollections() {
  return CACHE.collections;
}

/**
 *
 */
export class Collection {
  constructor(name, schema = {}, indexes = [], IdType = ObjectID) {
    this.name = name;
    this.schema = compileSchema(schema);
    this.indexes = indexes;
    this.IdType = IdType;
    CACHE.collections.set(this.name, this);
  }

  /**
   *
   */
  validate(value, options = {}) {
    return new Promise((resolve, reject) =>
      validateSchema(value, this.schema, options, (error, result) => (error ? reject(error) : resolve(result))),
    );
  }

  /**
   *
   */
  count(filter, options = {}) {
    return CACHE.db.collection(this.name).count(filter, options);
  }

  /**
   *
   */
  aggregate(pipeline, options = {}) {
    return CACHE.db.collection(this.name).aggregate(pipeline, options).map(toResult);
  }

  /**
   *
   */
  find(filter, options = {}) {
    return CACHE.db.collection(this.name).find(filter, options).toArray().then(toResult);
  }

  /**
   *
   */
  distinct(key, filter, options = {}) {
    return CACHE.db.collection(this.name).distinct(key, filter, options).then(toResult);
  }

  /**
   *
   */
  findOne(filter, options = {}) {
    return CACHE.db.collection(this.name).findOne(filter, options).then(toResult);
  }

  /**
   *
   */
  findOneAndReplace(filter, doc, options = {}) {
    return CACHE.db.collection(this.name).findOneAndReplace(filter, doc, {
      returnOriginal: false,
      ...options,
    }).then(toResult);
  }

  /**
   *
   */
  findOneAndUpdate(filter, updateOp, options = {}) {
    return CACHE.db.collection(this.name).findOneAndUpdate(filter, updateOp, {
      returnOriginal: false,
      ...options,
    }).then(toResult);
  }

  /**
   *
   */
  findOneAndDelete(filter, options = {}) {
    return CACHE.db.collection(this.name).findOneAndDelete(filter, options).then(toResult);
  }

  /**
   *
   */
  findById(id, options = {}) {
    return CACHE.db.collection(this.name).findOne({ _id: new this.IdType(id) }, options).then(toResult);
  }

  /**
   *
   */
  findByIdAndReplace(id, doc, options = {}) {
    return CACHE.db.collection(this.name).findOneAndReplace({ _id: new this.IdType(id) }, doc, {
      returnOriginal: false,
      ...options,
    }).then(toResult);
  }

  /**
   *
   */
  findByIdAndUpdate(id, operation, options = {}) {
    return CACHE.db.collection(this.name).findOneAndUpdate({ _id: new this.IdType(id) }, operation, {
      returnOriginal: false,
      ...options,
    }).then(toResult);
  }

  /**
   *
   */
  findByIdAndDelete(id, options = {}) {
    return CACHE.db.collection(this.name).findOneAndDelete({ _id: new this.IdType(id) }, options).then(toResult);
  }

  /**
   *
   */
  insertMany(docs, options = {}) {
    return CACHE.db.collection(this.name).insertMany(docs, options).then(toResult);
  }

  /**
   *
   */
  insertOne(doc, options = {}) {
    return CACHE.db.collection(this.name).insertOne(doc, options).then(toResult);
  }

  /**
   *
   */
  updateMany(filter, operation, options = {}) {
    return CACHE.db.collection(this.name).updateMany(filter, operation, options).then(result => result.modifiedCount);
  }

  /**
   *
   */
  updateOne(filter, operation, options = {}) {
    return CACHE.db.collection(this.name).updateOne(filter, operation, options).then(result => result.modifiedCount);
  }

  /**
   *
   */
  replaceOne(filter, doc, options = {}) {
    return CACHE.db.collection(this.name).replaceOne(filter, doc, options).then(result => result.modifiedCount);
  }

  /**
   *
   */
  deleteOne(filter, options = {}) {
    return CACHE.db.collection(this.name).deleteOne(filter, options).then(result => result.deletedCount);
  }

  /**
   *
   */
  deleteMany(filter, options = {}) {
    return CACHE.db.collection(this.name).deleteMany(filter, options).then(result => result.deletedCount);
  }

  /**
   *
   */
  paginate(filter, page = 1, options = {}) {
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
        this.count(filter),
        this.find(filter, { limit, sort, fields, skip: (page - 1) * limit }),
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
}
