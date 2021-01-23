/*
 * Create and export configuration variables
 *
 */

// Container for all the evnironments
let evnironments = {};

// Staging (default) evnironment
evnironments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'stripSecretKey': 'sk_test_51I7hSoGA94YalZ4kxSZURQe70XbE8jxXS8eE9e7xEJ3eCDpE0gNL5A13ssfK694253wXQdFKrD5VcnF02wZOTT0E00eSbfuPwO',
  'mailgun': {
    'apiKey': 'd5f49ca7c72d8617f9d0b5e3c42846df-e438c741-1ae4323e',
    'domain': 'sandboxc38d5c7af2aa4282b37ac2a8d9f75979.mailgun.org'
  }
}


// Production environments
evnironments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret',
  'stripSecretKey': 'sk_test_51I7hSoGA94YalZ4kxSZURQe70XbE8jxXS8eE9e7xEJ3eCDpE0gNL5A13ssfK694253wXQdFKrD5VcnF02wZOTT0E00eSbfuPwO',
  'mailgun': {
    'apiKey': 'd5f49ca7c72d8617f9d0b5e3c42846df-e438c741-1ae4323e',
    'domain': 'sandboxc38d5c7af2aa4282b37ac2a8d9f75979.mailgun.org'
  }
}

// Determine whitch environment was passed as a command-line argument
let currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current evnironment is one of the environment above, if not, default to staging
let environmentToExport = typeof (evnironments[currentEnvironment]) == 'object' ? evnironments[currentEnvironment] : evnironments.staging;

// Export module
module.exports = environmentToExport;