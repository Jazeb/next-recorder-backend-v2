import * as bcrypt from 'bcrypt';

export const getRandomSixDigitNumber = (): Number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const generateHashForPassword = async (
  value: string,
): Promise<string> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(value, saltRounds);
  return hash;
};

export const compareHash = async (
  value: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(value, hash);
};
