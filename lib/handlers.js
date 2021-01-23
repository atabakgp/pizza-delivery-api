/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
let handlers = {};

// Users
handlers.users = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
}

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data = firstName, lastName, email, password
// Optional data = none
handlers._users.post = function (data, callback) {
  // Check that all required fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  const address = typeof (data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;

  if (firstName && lastName && address && email && password) {
    // Make sure that the user doesnt already exist
    _data.read('users', email, function (err, data) {
      if (err) {
        // hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          // Create the user object
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'email': email,
            'streetAddress': address,
            'hashedPassword': hashedPassword,
          }

          // Store the user
          _data.create('users', email, userObject, function (err) {
            if (!err) {
              callback(200, {
                'Registered': 'The user with ' + email + ' email adress has been registered'
              });
            } else {
              // User already exist
              callback(500, {
                'Error': 'Could not create the new user'
              });
            }
          })
        } else {
          callback(500, {
            'Error': 'Could not hash the user\'s password '
          });
        }

      } else {
        callback(400, {
          'Error': 'A user with that email adress is already exist'
        });
      }
    });



  } else {
    callback(400, {
      'Error': 'Missing required fileds'
    });
  }
}

// Users - get
// Required data: email Address
// Optional data: none
// Only let an authenticated user access their object, don't let them access anyone else's
handlers._users.get = function (data, callback) {

  // Check that email adress is valid
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the email adresss
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', email, function (err, data) {
          if (!err && data) {
            // Remove the hashed password from the user object before returning it to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          'Error': 'Missing required token in header, or token is invalid'
        });
      }
    });

  } else {
    callback(400, {
      'Error': 'Missing required fields'
    });
  }
}

// Users - put
// Required data: email
// Optional data: firstName, lastName, password (at least one must specified)
handlers._users.put = function (data, callback) {
  // Check for the required fileds
  const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

  // Check for the optional fields
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the email is invalid
  if (email) {
    // Error if nothing is sent to update
    if (firstName || lastName || streetAddress || password) {

      // Get the token from the headers
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the email address
      handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', email, function (err, userData) {
            if (!err && userData) {
              // Update the fields necessary
              if (firstName) {
                userData.firstName = firstName
              }
              if (lastName) {
                userData.lastName = lastName
              }
              if (streetAddress) {
                userData.streetAddress = streetAddress;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', email, userData, function (err) {
                if (!err) {
                  callback(200, {
                    'Success': 'update user data'
                  });
                } else {
                  callback(400, {
                    'Error': 'Could not update the user'
                  });
                }
              });

            } else {
              callback(400, {
                'Error': 'The specified user does not exist'
              });
            }
          });
        } else {
          callback(403, {
            'Error': 'Missing required token in header, or token is invalid'
          });
        }
      });
    } else {
      callback(400, {
        'Error': 'Missing fields to update'
      });
    }
  } else {
    callback(400, {
      'Error': 'Missing required fields'
    });
  }
}

// Users - delete
// Required fields: email
handlers._users.delete = function (data, callback) {
  // Check that email adress is valid
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the email adress
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', email, function (err, userData) {
          if (!err && data) {
            _data.delete('users', email, function (err) {
              if (!err) {
                callback(200, {
                  'Success': 'Specific user deleted'
                });
              } else {
                callback(500, {
                  'Error': 'Could not delete the specified user'
                });
              }
            });
          } else {
            callback(404, {
              'Error': 'Could not find the specified user'
            });
          }
        });
      } else {
        callback(403, {
          'Error': 'Missing required token in header, or token is invalid'
        });
      }
    });
  } else {
    callback(400, {
      'Error': 'Missing required fields'
    });
  }
}

// Tokens
handlers.tokens = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
}

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
  const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (email && password) {
    // Lookup the user who matches that email adress
    _data.read('users', email, function (err, userData) {
      if (!err && userData) {
        // Hash the sent password and compared it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // If valid, create a new token, with a random name. Set expiration date 1 week in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
          const tokenObject = {
            'email': email,
            'id': tokenId,
            'expires': expires
          };
          // Store the token
          _data.create('tokens', tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(400, {
                'Error': 'Could not create the new token'
              })
            }
          });

        } else {
          callback(400, {
            'Error': 'Password did not match the specified user\'s stored password'
          });
        }

      } else {
        callback(400, {
          'Error': 'Could not find the specified user'
        });
      }
    });
  } else {
    callback(400, {
      'Error': 'Missing required filed(s)'
    })
  }
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
  // Check that id is valid
  const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the user
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {
      'Error': 'Missing required fields'
    });
  }
}

// Tokens - put
// required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if (id && extend) {
    // Lookup the token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        // Check to the make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration one week from now
          tokenData.expires = Date.now() + Date.now() + 1000 * 60 * 60 * 24 * 7;

          // Store the new updates
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                'Error': 'Could not update the token\'s expiration'
              })
            }
          })
        } else {
          callback(400, {
            'Error': 'The token has already expired, and cannot be extended'
          })
        }
      } else {
        callback(400, {
          'Error': 'Specified token does not exist'
        });
      }
    });

  } else {
    callback(400, {
      'Error': 'Missing required field(s) or field(s) are invalid'
    });
  }
}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback) {
  // Check that id is valid
  const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the user
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        _data.delete('tokens', id, function (err) {
          if (!err) {
            callback(200, {
              'Sucsess': 'User log out'
            });
          } else {
            callback(500, {
              'Error': 'Could not delete the specified token'
            });
          }
        });
      } else {
        callback(404, {
          'Error': 'Could not find the specified token'
        });
      }
    });
  } else {
    callback(400, {
      'Error': 'Missing required fields'
    });
  }
}


// Menu
handlers.menu = function (data, callback) {

  // Check that email adress is valid
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the email adresss
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('menu', 'menuItems', function (err, data) {
          if (!err && data) {
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          'Error': 'Missing required token in header, or token is invalid'
        });
      }
    });

  } else {
    callback(400, {
      'Error': 'Missing required fields'
    });
  }
}

handlers.cart = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._cart[data.method](data, callback);
  } else {
    callback(405);
  }
}

// Container for the cart
handlers._cart = {};

// Cart - post
// Required: token (headers) - email - pizza id
// Optional: none
handlers._cart.post = function (data, callback) {
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if (email) {
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read('menu', 'menu', function (err, menuData) {
          if (!err) {
            const orderData = data.payload;
            let cartData = [];
            for (const key in orderData) {
              let itemId = orderData[key].id;
              let itemSize = orderData[key].size;
              let pizzaName = menuData[itemId].name;
              let pizzaPrice = menuData[itemId][itemSize];
              let pizzaCount = orderData[key].count
              cartData.push({
                'name': pizzaName,
                'price': pizzaPrice,
                'qty': pizzaCount
              });
            }
            // Make sure that the cart doesnt already exist,if exist update it
            _data.read('cart', email, function (err) {
              if (err) {
                _data.create('cart', email, cartData, function (err) {
                  if (!err) {
                    callback(200, {
                      "Success": "Cart created"
                    });
                  } else {
                    callback(400);
                  }
                });
              } else {
                _data.update('cart', email, cartData, function (err) {
                  if (!err) {
                    callback(200, {
                      "Success": "Cart updated"
                    });
                  } else {
                    callback(400);
                  }
                });
              }
            });
          } else {
            callback(400);
          }
        });
      } else {
        callback(403, {
          'Error': 'Missing required token in header, or token is invalid'
        });
      }
    });
  }
}

// Checkout - post

handlers.checkout = function (data, callback) {
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if (email) {
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read('cart', email, function (err, cartData) {
          if (!err) {
            let total = null;
            cartData.map(item => {
              total += item.price * item.qty;
            });
            helpers.stripPayment(total, function (err) {
              if (!err) {
                _data.read('cart', email, function (err, cardData) {
                  if (!err) {
                    helpers.sendMail(email, cartData, total, function (err) {
                      if (!err) {
                        callback(200, {
                          'Success': 'email was sent'
                        });
                      } else {
                        callback(400, {
                          'Error': 'email was not send'
                        });
                      }
                    });
                  } else {
                    callback(400);
                  }
                })
              } else {
                callback(400);
              }
            });
          } else {
            callback(400);
          }
        });
      } else {
        callback(403, {
          'Error': 'Missing required token in header, or token is invalid'
        });
      }
    });
  }
}



// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, email, callback) {
  // Lookup the token
  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and not expired
      if (tokenData.email == email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
}

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
}

// Export the module
module.exports = handlers;