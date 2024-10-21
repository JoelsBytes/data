const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, phone, country } = req.body;

  // Validate input
  if (!name || !phone || !country) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const countryMap = {
    Ghana: 'GH',
    Togo: 'TG',
    Benin: 'BN',
    'Ivory Coast': 'CI',
    'Burkina Faso': 'BF',
    Senegal: 'SN',
    Mali: 'ML',
  };

  const countryIndex = countryMap[country] || '';

  const filePath = path.join(process.cwd(), 'public', 'CustomerData.xlsx');

  let rows = [];

  // Check if the Excel file already exists
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Customers'];
    const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    rows = existingData.length > 1 ? existingData.slice(1) : [];
  } else {
    rows.push(['Name', 'Phone Number']); // Add headers if file does not exist
  }

  // Append new data
  rows.push([`${name.toUpperCase()} ${countryIndex}`, phone]);

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet([['Name', 'Phone Number'], ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  // Save the workbook
  XLSX.writeFile(workbook, filePath);

  return res.status(200).json({ message: 'Customer data saved successfully!' });
}
