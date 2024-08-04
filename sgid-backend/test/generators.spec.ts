import { generatePkcePair, generateCodeVerifier, generateCodeChallenge, generateNonce } from '../src/generators';
import * as Errors from '../src/error';

describe('PKCE Generators', () => {
  describe('generatePkcePair', () => {
    it('should generate a PKCE pair with default length', () => {
      const pair = generatePkcePair();
      expect(pair.codeVerifier).toHaveLength(43);
      expect(pair.codeChallenge).toBeDefined();
    });

    it('should generate a PKCE pair with minimum length', () => {
      const pair = generatePkcePair(43);
      expect(pair.codeVerifier).toHaveLength(43);
      expect(pair.codeChallenge).toBeDefined();
    });

    it('should generate a PKCE pair with maximum length', () => {
      const pair = generatePkcePair(128);
      expect(pair.codeVerifier).toHaveLength(128);
      expect(pair.codeChallenge).toBeDefined();
    });

    it('should throw an error if length is less than minimum', () => {
      expect(() => generatePkcePair(42)).toThrow(Errors.PKCE_PAIR_LENGTH_ERROR);
    });

    it('should throw an error if length is more than maximum', () => {
      expect(() => generatePkcePair(129)).toThrow(Errors.PKCE_PAIR_LENGTH_ERROR);
    });
  });

  describe('generateCodeVerifier', () => {
    it('should generate a code verifier with default length', () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toHaveLength(43);
    });

    it('should generate a code verifier with minimum length', () => {
      const verifier = generateCodeVerifier(43);
      expect(verifier).toHaveLength(43);
    });

    it('should generate a code verifier with maximum length', () => {
      const verifier = generateCodeVerifier(128);
      expect(verifier).toHaveLength(128);
    });

    it('should throw an error if length is less than minimum', () => {
      expect(() => generateCodeVerifier(42)).toThrow(Errors.CODE_VERIFIER_LENGTH_ERROR);
    });

    it('should throw an error if length is more than maximum', () => {
      expect(() => generateCodeVerifier(129)).toThrow(Errors.CODE_VERIFIER_LENGTH_ERROR);
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate a code challenge for a given verifier', () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      expect(challenge).toBeDefined();
    });

    it('should handle an empty string verifier', () => {
      const challenge = generateCodeChallenge('');
      expect(challenge).toBeDefined();
    });
  });

  describe('generateNonce', () => {
    it('should generate a nonce with default byte size', () => {
      const nonce = generateNonce();
      expect(nonce).toBeDefined();
    });

    it('should generate a nonce with a specific byte size', () => {
      const nonce = generateNonce(16);
      expect(nonce).toBeDefined();
    });
  });
});