class ServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.message = 'Сервер не может обработать запрос';
  }
}

module.exports = ServerError;
