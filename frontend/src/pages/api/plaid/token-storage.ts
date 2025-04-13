import fs from 'fs';
import path from 'path';

const TOKEN_FILE = path.join(process.cwd(), 'plaid-token.json');

export const getPlaidToken = () => {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = fs.readFileSync(TOKEN_FILE, 'utf8');
      return JSON.parse(data).token;
    }
  } catch (error) {
    console.error('Error reading token:', error);
  }
  return null;
};

export const setPlaidToken = (token: string) => {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }));
    console.log('Plaid token stored successfully');
  } catch (error) {
    console.error('Error storing token:', error);
  }
}; 