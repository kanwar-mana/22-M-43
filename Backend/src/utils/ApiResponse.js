class ApiResponse {
  constructor(statusCode, data, message = "Success", action = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.action = action;
  }
}

export { ApiResponse };
