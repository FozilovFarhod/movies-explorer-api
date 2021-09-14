function isURL(value) {
  const regex = /^(https?:\/\/)(www\.)?[^?^!^-][\S^.]{1,255}\.\S*/;
  const isValid = regex.test(value);
  if (isValid) {
    return value;
  }
  throw new Error('Некорректный URL');
}

module.exports = isURL;
