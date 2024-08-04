import { isNonEmptyString, safeJsonParse } from '../src/util';

describe('isNonEmptyString', () => {
  it('should return true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON strings', () => {
    const jsonString = '{"key":"value"}';
    expect(safeJsonParse(jsonString)).toEqual({ key: 'value' });
  });

  it('should return the original string for invalid JSON strings', () => {
    const invalidJsonString = '{"key": "value"';
    expect(safeJsonParse(invalidJsonString)).toBe(invalidJsonString);
  });

  it('should parse JSON strings representing primitive values', () => {
    expect(safeJsonParse('"hello"')).toBe("hello");
    expect(safeJsonParse('123')).toBe(123);
    expect(safeJsonParse('true')).toBe(true);
  });
});