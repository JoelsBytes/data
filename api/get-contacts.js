const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const filePath = path.join(process.cwd(), 'public', 'CustomerData.xlsx');

  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Customers'];

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const contacts = data.slice(1).map(row => ({
      name: row[0],
      phone: row[1],
    }));

    return res.status(200).json({ contacts });
  } else {
    return res.status(200).json({ contacts: [] });
  }
}
