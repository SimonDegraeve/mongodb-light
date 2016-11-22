/**
 *
 */
function strToObj(value, negativeValue, positiveValue, separator = /\s+/) {
  if (typeof value === 'string') {
    return value.split(separator).reduce((obj, item) => {
      const order = item[0] === '-' ? negativeValue : positiveValue;
      let key = order === negativeValue ? item.slice(1) : item;

      if (key === 'id') {
        key = '_id'
      }

      return { ...obj, [key]: order };
    }, {});
  }
  return value;
}


/**
 *
 */
export function toSort(value, separator) {
  return strToObj(value, -1, 1, separator);
}


/**
 *
 */
export function toFields(value, separator) {
  return strToObj(value, 0, 1, separator);
}

/**
 *
 */
function normalizeId(doc) {
  if (typeof doc._id !== 'undefined') {
    doc.id = doc._id; // eslint-disable-line no-param-reassign
    delete doc._id; // eslint-disable-line no-param-reassign
  }
  return doc;
}

/**
 *
 */
export function toResult(result) {
  if (Array.isArray(result)) {
    return result.map(normalizeId);
  }
  else if (typeof result.value !== 'undefined' && typeof result._id === 'undefined') {
    return result.value ? normalizeId(result.value) : undefined;
  }
  else if (typeof result.ops !== 'undefined' && typeof result._id === 'undefined') {
    return result.ops.map(normalizeId);
  }
  else if (typeof result._id !== 'undefined') {
    return normalizeId(result);
  }
  return result;
}
