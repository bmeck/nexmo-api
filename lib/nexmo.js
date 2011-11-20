

var request = require('request'),
  queryString = require('querystring');

exports.createClient = createClient;

function createClient(config) {
  return new NexmoClient(config);
}

function NexmoClient(config) {
  if (!config.key || !config.secret) {
    throw new Error('Invalid config');
  }
  this.key = encodeURIComponent(config.key + '');
  this.secret = encodeURIComponent(config.secret + '');
  return this;
}

NexmoClient.ERRORS = {
  "0": {
    type: 'Success',
    message: 'The message was successfully accepted for delivery by nexmo'
  },
  "1": {
    type: 'Throttled',
    message: 'You have exceeded the submission capacity allowed on this account, please back-off and retry'
  },
  "2": {
    type: 'Missing params',
    message: 'Your request is incomplete and missing some mandatory parameters'
  },
  "3": {
    type: 'Invalid params',
    message: 'Thevalue of one or more parameters is invalid'
  },
  "4": {
    type: 'Invalid credentials',
    message: 'The username / password you supplied is either invalid or disabled'
  },
  "5": {
    type: 'Internal error',
    message: 'An error has occurred in the nexmo platform whilst processing this message'
  },
  "6": {
    type: 'Invalid message',
    message: 'The Nexmo platform was unable to process this message, for example, an un-recognized number prefix'
  },
  "7": {
    type: 'Number barred',
    message: 'The number you are trying to submit to is blacklisted and may not receive messages'
  },
  "8": {
    type: 'Partner account barred',
    message: 'The username you supplied is for an account that has been barred from submitting messages'
  },
  "9": {
    type: 'Partner quota exceeded',
    message: 'Your pre-pay account does not have sufficient credit to process this message'
  },
  "10": {
    type: 'Too many existing binds',
    message: 'The number of simultaneous connections to the platform exceeds the capabilities of your account'
  },
  "11": {
    type: 'Account not enabled for REST',
    message: 'This account is not provisioned for REST submission, you should use SMPP instead'
  },
  "12": {
    type: 'Message too long',
    message: 'Applies to Binary submissions, where the length of the UDF and the message body combined exceed 140 octets'
  },
  "15": {
    type: 'Invalid sender address',
    message: 'The sender address (from parameter) was not allowed for this message'
  },
  "16": {
    type: 'Invalid TTL',
    message: 'The ttl parameter values is invalid'
  }
}

NexmoClient.prototype.getBalance = function getBalance(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  request.get({
    url: 'https://rest.nexmo.com/account/get-balance/'+this.key+'/'+this.secret,
    headers: {
      'Accept': 'application/json'
    }
  }, function handleBalanceResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
}

NexmoClient.prototype.getPricing = function getPricing(options_or_countryCode, callback) {
  var countryCode;
  switch (typeof options_or_countryCode) {
    case 'string':
      countryCode = options_or_countryCode;
      break;
    case 'object':
      if (options_or_countryCode['country-code']) {
        countryCode = options_or_countryCode['country-code'];
      }
      break;
  }
  if (!countryCode) {
    throw new Error('Invalid countryCode');
  }
  request.get({
    url: 'https://rest.nexmo.com/account/get-pricing/outbound/'+this.key+'/'+this.secret+'/'+countryCode,
    headers: {
      'Accept': 'application/json'
    }
  }, function handlePricingResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
}

NexmoClient.prototype.updateSettings = function updateSettings(options_or_newSecret, callback) {
  var self = this,
    params = {};
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  switch (typeof options_or_newSecret) {
    case 'string':
      params.newSecret = options_or_newSecret;
      break;
    case 'object':
      if (options_or_newSecret.newSecret) {
        params.newSecret = options_or_newSecret.newSecret;
      }
      if (options_or_newSecret.moCallBackUrl) {
        params.moCallBackUrl = options_or_newSecret['mo-callback-url'];
      }
      if (options_or_newSecret.drCallBackUrl) {
        params.drCallBackUrl = options_or_newSecret['dr-callback-url'];
      }
      break;
  }
  if (params.newSecret && (params.newSecret + '').length > 8) {
    throw new Error('Invalid newSecret');
  }
  request.post({
    url: 'https://rest.nexmo.com/account/settings/'+this.key+'/'+this.secret+'?'+queryString.encode(params),
    headers: {
      'Accept': 'application/json'
    }
  }, function handleSettingsResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    self.secret = params.newSecret;
    return callback(false, result);
  });
}

NexmoClient.prototype.getNumbers = function getNumbers(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  request.get({
    url: 'https://rest.nexmo.com/account/numbers/'+this.key+'/'+this.secret,
    headers: {
      'Accept': 'application/json'
    }
  }, function handleNumbersResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
}

NexmoClient.prototype.searchNumbers = function searchNumbers(options_or_countryCode, callback) {
  var params = {},
    countryCode;
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  switch (typeof options_or_countryCode) {
    case 'string':
      countryCode = options_or_countryCode;
      break;
    case 'object':
      countryCode = options_or_countryCode['country-code'];
      if (options_or_countryCode.pattern) {
        params.pattern = options_or_countryCode.pattern;
      }
      break;
  }
  if (!countryCode) {
    throw new Error('country-code required');
  }
  request.get({
    url: 'https://rest.nexmo.com/number/search/'+this.key+'/'+this.secret+'/'+countryCode+'?'+queryString.encode(params),
    headers: {
      'Accept': 'application/json'
    }
  }, function handleSearchResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
}

NexmoClient.prototype.buyNumber = function buyNumber(options, callback) {
  var msisdn,
    countryCode;
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  switch (typeof options) {
    case 'object':
      countryCode = options['country-code'];
      msisdn = options.msisdn;
      break;
  }
  if (!countryCode || !msisdn) {
    throw new Error('Invalid options');
  }
  request.post({
    url: 'https://rest.nexmo.com/number/buy/'+this.key+'/'+this.secret+'/'+countryCode+'/'+msisdn,
    headers: {
      'Accept': 'application/json'
    }
  }, function handleBuyResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
}

NexmoClient.prototype.cancelNumber = function cancelNumber(options, callback) {
  var msisdn,
    countryCode;
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  switch (typeof options) {
    case 'object':
      countryCode = options['country-code'];
      msisdn = options.msisdn;
      break;
  }
  if (!countryCode || !msisdn) {
    throw new Error('Invalid options');
  }
  request.post({
    url: 'https://rest.nexmo.com/number/buy/'+this.key+'/'+this.secret+'/'+countryCode+'/'+msisdn,
    headers: {
      'Accept': 'application/json'
    }
  }, function handleCancelResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
}

NexmoClient.prototype.send = function send(options, callback) {
  var params = {
    username: this.key,
    password: this.secret
  };
  if (typeof callback !== 'function') {
    throw new Error('Expected callback');
  }
  switch (typeof options) {
      case 'object':
      params.from = options.from;
      params.to = options.to;
      if (options.type) {
        params.type = options.type;
      }
      if (options['status-report-req']) {
        params['status-report-req'] = options['status-report-req'];
      }
      if (options['client-ref']) {
        params['client-ref'] = options['client-ref'];
      }
      if (options['network-code']) {
        params['network-code'] = options['network-code'];
      }
      if (options.vcard) {
        params.vcard = options.vcard;
      }
      if (options.vcal) {
        params.vcal = options.vcal;
      }
      if (options.ttl) {
        params.ttl = options.ttl;
      }
      break;
  }
  if (!params.from || !params.to) {
    throw new Error('Invalid options');
  }
  if (params.type && !{
      binary: 1,
      "default": 1,
      text: 1,
      unicode: 1,
      vcal: 1,
      vcard: 1,
      wappush: 1
    }[params.type]) {
    throw new Error('Invalid type');
  }
  if (params.type === 'binary') {
    params.body = [].slice.call(options.body).map(function toHex(item) {
      return (typeof item === 'string' ? item.charCodeAt(0) : +item).toString(16);
    });
    params.udh = [].slice.call(options.udh).map(function toHex(item) {
      return (typeof item === 'string' ? item.charCodeAt(0) : +item).toString(16);
    });;
    if (!params.body || !params.udh) {
      throw new Error('Invalid options');
    }
  }
  else if (params.type === 'wappush') {
    params.title = options.title;
    params.url = options.url;
    params.validity = options.validity;
    if (!params.title || !params.url || !params.validity || isNaN(params.validity)) {
      throw new Error('Invalid options');
    }
  }
  else if (!params.type || {"default":1,"text":1,"unicode":1}[params.type]) {
    if (options.text) {
      params.text = options.text;
    }
    if (!params.text) {
      throw new Error('Invalid options');
    }
  }
  request.post({
    url: 'http://rest.nexmo.com/sms/json?'+queryString.encode(params),
    headers: {
      'Accept': 'application/json'
    }
  }, function handleSendResponse(error, response, body) {
    if (error || !body || response.statusCode !== 200) {
      return callback(error || response);
    }
    var result;
    try {
      result = JSON.parse(body);
    }
    catch (parseError) {
      return callback(parseError);
    }
    return callback(false, result);
  });
} 