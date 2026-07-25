import PayOS from '@payos/node';
import dotenv from 'dotenv';
dotenv.config();

const payos = new (PayOS.PayOS || PayOS)({
  clientId: process.env.PAYOS_CLIENT_ID || 'client-id',
  apiKey: process.env.PAYOS_API_KEY || 'api-key',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'checksum-key'
});

export default payos;
