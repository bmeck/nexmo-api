var nexmo = require('../');

var client = nexmo.createClient({
  key: '---',
  secret: '---'
});

//client.getBalance(function printBalance(error, value) {
//  console.log('balance', value);
//});

//client.getPricing('US', function printPricing(error, value) {
//  console.log('pricing', value);
//});

//client.updateSettings('---', function printSettings(error, value) {
//  console.log(value);
//});

client.send({
  from: 'nodenexmo',
  to: '15555555555',
  text: 'test!'
}, function printSend(error, value) {
  console.error(value.messages);
})
