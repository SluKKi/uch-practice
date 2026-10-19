import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_conf_rf_2027';
