const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static('public'));
app.use(bodyParser.json());

// Map country names to their codes
function getCountryIndex(country) {
  const countryMap = {
    Ghana: 'GH',
    Togo: 'TG',
    Benin: 'BN',
    'Ivory Coast': 'CI',
    'Burkina Faso': 'BF',
    Senegal: 'SN',
    Mali: 'ML',
  };

  return countryMap[country] || '';
}

// Function to generate the Excel file or append to it
function generateExcel(newData) {
  const filePath = path.join(__dirname, 'public', 'CustomerData.xlsx');

  let rows = [];

  // Check if the Excel file already exists
  if (fs.existsSync(filePath)) {
    // Read the existing file and get current rows
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Customers'];
    const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Exclude the header and add the existing rows
    rows = existingData.length > 1 ? existingData.slice(1) : [];
  } else {
    // If no file exists, create a new one with headers
    rows.push(['Name', 'Phone Number']);
  }

  // Append new data rows
  newData.forEach(entry => {
    const countryIndex = getCountryIndex(entry.country);
    rows.push([`${entry.name.toUpperCase()} ${countryIndex}`, entry.phone]);
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet([['Name', 'Phone Number'], ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  // Save the workbook to a file
  XLSX.writeFile(workbook, filePath);
}

// Endpoint to receive customer data and save to Excel
app.post('/save-customer', (req, res) => {
  const { name, phone, country } = req.body;

  if (!name || !phone || !country) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Add the new customer data to the Excel file
  generateExcel([{ name, phone, country }]);

  res.json({ message: 'Customer data saved successfully!' });
});

// Endpoint to read the Excel file and return contacts as JSON
app.get('/get-contacts', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'CustomerData.xlsx');

  if (fs.existsSync(filePath)) {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Customers'];

    // Convert the worksheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Extract names and phone numbers (excluding the header)
    const contacts = data.slice(1).map(row => ({
      name: row[0],
      phone: row[1],
    }));

    res.json({ contacts });
  } else {
    res.json({ contacts: [] });
  }
});

// Endpoint to delete a contact
app.post('/delete-contact', (req, res) => {
  const { name, phone } = req.body;
  const filePath = path.join(__dirname, 'public', 'CustomerData.xlsx');

  if (fs.existsSync(filePath)) {
    // Read the Excel file
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

    res.json({ message: 'Contact deleted successfully!' });
  } else {
    res.json({ message: 'No contacts found to delete.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
