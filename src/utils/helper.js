exports.randomCode = () => {
  var min = 10000;
  var max = 90000;
  var num = Math.floor(Math.random() * min) + max;
  return num;
};

exports.randomCardNumber = () => {
  let result = "6077";
  const characters = "0123456789";
  let counter = 0;
  while (counter < 12) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter += 1;
  }
  return result;
};

exports.randomAccountNumber = () => {
  let result = "";
  const characters = "0123456789";
  let counter = 0;
  while (counter < 8) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    if (result === "0") {
      result = "";
      continue;
    }
    counter += 1;
  }
  return result;
};

exports.randomCvv2 = () => {
  var min = 1000;
  var max = 9000;
  var num = Math.floor(Math.random() * min) + max;
  return num;
};

exports.randomShaba = (accountNumber) => {
  let result = "IR";
  const characters = "0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 24) {
    if (counter === 13) {
      result += accountNumber;
      counter += 8;
      continue;
    }
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
