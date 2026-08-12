import QRCode from 'qrcode';

export const generateFamilyQR = async (familyId, baseUrl) => {
  const url = `${baseUrl}/families/${familyId}`;
  return QRCode.toDataURL(url, { width: 300, margin: 2 });
};

export const generateFamilyId = async (surname) => {
  const prefix = (surname || 'FAM').substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};
