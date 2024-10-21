function validatePhoneNumber(ctr, sr, pr, vp) {
  if (ctr === 'Ghana') {
    pr = sr.slice(0, 3);
    vp = ['024', '025', '053', '054', '055', '059', '027', '057', '026', '056', '020', '050'];
    if (vp.includes(pr) && sr.length === 10) {
      return sr;
    } else {
      return false;
    }
  } else if (ctr === 'Togo') {
    pr = sr.slice(0, 2);
    vp = ['99', '98', '97', '96', '79', '78', '77', '76', '93', '92', '91', '90', '72', '71', '70'];
    if (vp.includes(pr) && sr.length === 8) {
      return sr;
    } else {
      return false;
    }
  } else if (ctr === 'Benin') {
    pr = sr.slice(0, 2);
    vp = [
      '45',
      '52',
      '54',
      '55',
      '56',
      '57',
      '60',
      '61',
      '62',
      '63',
      '64',
      '65',
      '66',
      '67',
      '68',
      '69',
      '90',
      '91',
      '94',
      '95',
      '96',
      '97',
      '98',
      '99',
    ];
    if (vp.includes(pr) && sr.length === 8) {
      return sr;
    } else {
      return false;
    }
  } else if (ctr === 'Ivory Coast') {
    pr = sr.slice(0, 2);
    vp = ['05', '07', '01'];
    if (vp.includes(pr) && sr.length === 10) {
      return sr;
    } else {
      return false;
    }
  } else if (ctr === 'Burkina Faso') {
    pr = sr.slice(0, 2);
    vp = [
      '05',
      '06',
      '07',
      '54',
      '55',
      '56',
      '57',
      '64',
      '65',
      '66',
      '75',
      '77',
      '01',
      '02',
      '03',
      '51',
      '52',
      '53',
      '60',
      '61',
      '62',
      '63',
    ];
    if (vp.includes(pr) && sr.length === 8) {
      return sr;
    } else {
      return false;
    }
  } else if (ctr === 'Senegal') {
    return true;
  } else if (ctr === 'Mali') {
    return true;
  }
}

document.getElementById('customer-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const country = document.getElementById('country').value;
  const name = document.getElementById('name').value.trim();
  let phone = document.getElementById('phone').value.trim();
  phone = validatePhoneNumber(country, phone); // Keep your validation logic here

  if (!phone) {
    document.getElementById('status').textContent = `Invalid Phone Number for ${country}`;
    document.getElementById('status').style.color = 'red';
    return; // Stop form submission if validation fails
  }

  const customerData = {
    name,
    phone,
    country,
  };

  // Update the endpoint to point to the serverless function
  fetch('/api/save-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('status').textContent = data.message;
      document.getElementById('status').style.color = 'darkgreen';
      // Instead of reloading the page, let's load the updated contacts list dynamically
      loadContacts(); // Reload the contacts after saving
      document.getElementById('customer-form').reset();
    })
    .catch(error => {
      document.getElementById('status').textContent = 'Error saving data';
      document.getElementById('status').style.color = 'red';
      console.error('Error:', error);
    });
});

// Load and display the last 3 saved contacts
function loadContacts() {
  // Update the endpoint to point to the serverless function
  fetch('/api/get-contacts')
    .then(response => response.json())
    .then(data => {
      const savedContactsDiv = document.getElementById('saved-contacts');
      savedContactsDiv.innerHTML = ''; // Clear previous contacts

      if (data.contacts.length > 0) {
        const lastThreeContacts = data.contacts.slice(-3); // Get last 3 contacts

        lastThreeContacts.forEach((contact, index) => {
          const contactElement = document.createElement('p');
          contactElement.innerHTML = `${contact.name}     ${contact.phone} `;

          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', function () {
            deleteContact(index, contact.name, contact.phone); // Pass contact details to delete function
          });

          contactElement.appendChild(deleteButton);
          savedContactsDiv.appendChild(contactElement);
        });
      } else {
        savedContactsDiv.textContent = 'No contacts saved yet.';
      }
    })
    .catch(error => {
      console.error('Error fetching contacts:', error);
    });
}

// Delete contact
function deleteContact(index, name, phone) {
  // Update the endpoint to point to the serverless function
  fetch('/api/delete-contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, phone }),
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('status').textContent = data.message;
      loadContacts(); // Reload contacts after deleting
    })
    .catch(error => {
      console.error('Error deleting contact:', error);
    });
}

// Load contacts when the page loads
document.addEventListener('DOMContentLoaded', loadContacts);
