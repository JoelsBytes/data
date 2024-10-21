const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const { Readable } = require('stream');

// Initialize the S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'your-region', // e.g., 'us-west-1'
});

const bucketName = 'your-bucket-name';
const fileName = 'CustomerData.xlsx';

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

async function uploadToS3(buffer, fileName) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  await s3.upload(params).promise();
}

async function downloadFromS3(fileName) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };
  const data = await s3.getObject(params).promise();
  return data.Body;
}

function generateExcelBuffer(newData, existingRows) {
  const rows = existingRows || [['Name', 'Phone Number']];

  newData.forEach(entry => {
    const countryIndex = getCountryIndex(entry.country);
    rows.push([`${entry.name.toUpperCase()} ${countryIndex}`, entry.phone]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

app.post('/save-customer', async (req, res) => {
  try {
    const { name, phone, country } = req.body;

    if (!name || !phone || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Download the current file from S3
    let existingFile = [];
    try {
      const fileBuffer = await downloadFromS3(fileName);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets['Customers'];
      existingFile = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (error) {
      console.log('File not found in S3, will create a new one.');
    }

    // Generate new Excel data with the new customer
    const excelBuffer = generateExcelBuffer([{ name, phone, country }], existingFile);

    // Upload updated file to S3
    await uploadToS3(excelBuffer, fileName);

    return res.json({ message: 'Customer data saved successfully!' });
  } catch (error) {
    console.error('Error saving customer data:', error);
    return res.status(500).json({ message: 'A server error occurred' });
  }
});
