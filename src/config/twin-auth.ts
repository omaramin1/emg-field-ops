export interface TwinConfig {
  baseUrl: string;
  auth: {
    username: string;
    password: string;
  };
}

export const twinConfig: TwinConfig = {
  baseUrl: 'https://builder.twin.so',
  auth: {
    username: 'EMN058',
    password: 'Enm058'
  }
};

export async function authenticateTwin(): Promise<string | null> {
  try {
    console.log('Authenticating with Twin.so...');
    // For now, return a mock token since we're in development
    // In production, this would make actual API calls
    return 'mock-twin-token-' + Date.now();
  } catch (error) {
    console.error('Twin authentication error:', error);
    return null;
  }
}