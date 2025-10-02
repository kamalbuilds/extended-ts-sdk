import { StarkPerpetualAccount } from '../../perpetual/accounts';
import { SigningError } from '../../errors';

describe('StarkPerpetualAccount', () => {
  const validPrivateKey = '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12';
  const validPublicKey = '0x987654321abcdef987654321abcdef987654321abcdef987654321abcdef98';
  const apiKey = 'test-api-key';

  test('should create account with string vault', () => {
    const account = new StarkPerpetualAccount('123', validPrivateKey, validPublicKey, apiKey);
    expect(account.vaultId).toBe(123);
    expect(account.apiKeyValue).toBe(apiKey);
  });

  test('should create account with number vault', () => {
    const account = new StarkPerpetualAccount(456, validPrivateKey, validPublicKey, apiKey);
    expect(account.vaultId).toBe(456);
  });

  test('should throw error for invalid private key', () => {
    expect(() => {
      new StarkPerpetualAccount(123, 'invalid-key', validPublicKey, apiKey);
    }).toThrow(SigningError);
  });

  test('should throw error for invalid public key', () => {
    expect(() => {
      new StarkPerpetualAccount(123, validPrivateKey, 'invalid-key', apiKey);
    }).toThrow(SigningError);
  });

  test('should throw error for invalid vault type', () => {
    expect(() => {
      new StarkPerpetualAccount({} as any, validPrivateKey, validPublicKey, apiKey);
    }).toThrow('Invalid vault type');
  });

  test('should return correct public key hex', () => {
    const account = new StarkPerpetualAccount(123, validPrivateKey, validPublicKey, apiKey);
    expect(account.publicKeyHex).toMatch(/^0x[0-9a-f]+$/i);
  });

  test('should have empty trading fees initially', () => {
    const account = new StarkPerpetualAccount(123, validPrivateKey, validPublicKey, apiKey);
    expect(account.tradingFees.size).toBe(0);
  });
});