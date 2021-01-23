/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const http = require('http');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;


// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}

// Parsing a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
}

// Create a string of random alphanumeric charachters, of a given length
helpers.createRandomString = function (strLenght) {
  strLenght = typeof (strLenght) == 'number' && strLenght > 0 ? strLenght : false;
  if (strLenght) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'qwertyuiopasdfghjklzxcvbnm1234567890';

    // Start the final string
    let str = '';
    for (let i = 1; i <= strLenght; i++) {
      // Get a random character from the possibleCharacters string
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

      // Append this characters to final string
      str += randomCharacter;
    }
    // Return the final string
    return str;

  } else {
    return false
  }
}

helpers.stripPayment = function (total, callback) {
  if (total) {
    // Configure the request payload
    const payload = {
      'amount': total * 100,
      'currency': 'usd',
      'source': 'tok_visa',
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);

    // Configure the request details 
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.stripe.com',
      'method': 'POST',
      'path': '/v1/charges',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
        'Authorization': 'Bearer ' + config.stripSecretKey
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request
      const status = res.statusCode;

      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function (e) {
      callback(e);
    });
    // Add the payload
    req.write(stringPayload);

    // End the request 
    req.end();

  } else {
    callback('Given paramaters were missing or invalid');
  }

}

helpers.sendMail = function (email, cartData, total, callback) {

  if (email) {
    let template =
      `<table style="width: 100%; border-collapse: collapse; text-align: center">
        <tr>
          <th style="border: 1px solid #dddddd">Name</th>
          <th style="border: 1px solid #dddddd">Price</th>
          <th style="border: 1px solid #dddddd">Quantity</th>
        </tr>`;
    cartData.map(el => {
      template += `
    <tr>
      <td style="border: 1px solid #dddddd">${el.name}</td>
      <td style="border: 1px solid #dddddd">$${el.price}</td>
      <td style="border: 1px solid #dddddd">${el.qty}</td>
    </tr>`
    });
    template += `</table>
    <div style="text-align:center">Total Price: <strong>$${total} </strong> </div>`
    // Configure the request payload
    const payload = {
      from: "Mailgun Sandbox <postmaster@sandboxc38d5c7af2aa4282b37ac2a8d9f75979.mailgun.org>",
      to: email,
      subject: "Receipt - Pizza Delivery",
      text: "Your Order Receipt:",
      html: template
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // Configure the request details
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.mailgun.net',
      'method': 'POST',
      'path': '/v3/' + config.mailgun.domain + '/messages',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
        'Authorization': `Basic ${Buffer.from(`api:${config.mailgun.apiKey}`).toString('base64')}`,
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request
      const status = res.statusCode;

      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(true);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function (e) {
      callback(e);
    });
    // Add the payload
    req.write(stringPayload);

    // End the request 
    req.end();

  } else {
    callback('Given paramaters were missing or invalid');
  }

}


// Export the module
module.exports = helpers;