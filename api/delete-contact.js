const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, phone } = req.body;
  const filePath = path.join(process.cwd(), 'public', 'CustomerData.xlsx');

  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Customers'];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Filter out the contact to delete
    const updatedData = data.filter(row => !(row[0] === name && row[1] === phone));

    // Create new worksheet with the remaining data
    const newWorksheet = XLSX.utils.aoa_to_sheet(updatedData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Customers');

    // Save the updated workbook
    XLSX.writeFile(newWorkbook, filePath);

    return res.status(200).json({ message: 'Contact deleted successfully!' });
  } else {
    return res.status(200).json({ message: 'No contacts found to delete.' });
  }
}
