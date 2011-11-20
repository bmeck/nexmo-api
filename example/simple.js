var nexmo = require('../');

var client = nexmo.createClient({
  key: '---',
  secret: '---'
});

client.getBalance(function printBalance(error, value) {
  console.log('balance', value);
});

client.getPricing('US', function printPricing(error, value) {
  console.log('pricing', arguments);
});

client.updateSettings('---', function printSettings(error, value) {
  console.log('settings', value);
});

client.getNumbers(function printNumbers(error, value) {
  console.log('numbers', value);
})

client.searchNumbers({"country-code":'US',"pattern":"11"},function printNumbers(error, value) {
  console.log(value);
})

client.send({
  from: 'MyCompany20',
  to: '15124978584',
  text: 'test!'
}, function printSend(error, value) {
  console.error(value.messages);
});
