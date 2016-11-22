/**
 *
 */
import { toSort, toFields, toResult } from '../utils';

/**
 *
 */
describe('toSort()', () => {
  it('let object through', () => {
    expect(toSort({ a: 1 })).toEqual({ a: 1 });
  });

  it('returns an object from a string', () => {
    expect(toSort('a -b')).toEqual({ a: 1, b: -1 });
  });

  it('supports custom string separator', () => {
    expect(toSort('a,-b', ',')).toEqual({ a: 1, b: -1 });
  });

  it('transforms id', () => {
    expect(toSort('id')).toEqual({ _id: 1 });
  });
});

describe('toFields()', () => {
  it('returns the same object', () => {
    expect(toFields({ a: 1 })).toEqual({ a: 1 });
  });

  it('returns an object from a string', () => {
    expect(toFields('a -b')).toEqual({ a: 1, b: 0 });
  });

  it('supports custom string separator', () => {
    expect(toFields('a,-b', ',')).toEqual({ a: 1, b: 0 });
  });

  it('transforms id', () => {
    expect(toFields('id')).toEqual({ _id: 1 });
  });
});

describe('toResult', () => {
  it('let object through', () => {
    expect(toResult({ a: 1 })).toEqual({ a: 1 });
  });

  it('returns a transformed document', () => {
    expect(toResult({ _id: 1 })).toEqual({ id: 1 });
  });

  it('returns a transformed document from value', () => {
    expect(toResult({ value: { _id: 1 } })).toEqual({ id: 1 });
  });

  it('returns undefined from null value', () => {
    expect(toResult({ value: null })).toEqual(undefined);
  });

  it('returns an array of transformed documents', () => {
    expect(toResult([{ _id: 1 }, { _id: 2 }])).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('returns an array of transformed documents from ops', () => {
    expect(toResult({ ops: [{ _id: 1 }, { _id: 2 }] })).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
