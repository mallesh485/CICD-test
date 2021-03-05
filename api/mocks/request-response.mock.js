const mockResponse = () => {
  const res = {};
  res.status = jest.fn((statusCode) => {
    return { status: statusCode, ...res };
  });
  res.json = jest.fn((data) => data);
  res.download = jest.fn((path) => path);
  return res;
};

const mockRequest = ({
  userEmail = null,
  params = {},
  body = {},
  file = null,
}) => {
  if (!userEmail) {
    return {};
  }
  return {
    headers: {
      "x-user-email": userEmail,
    },
    params,
    body,
    file,
  };
};

const mockNext = (err) => {
  const status = err.status || 500;
  return {
    status,
    details: err.details || undefined,
    stackTrace: err.stack || undefined,
    message: err.message || "Internal server error.",
    ...err.data,
  };
};

module.exports = { mockRequest, mockResponse, mockNext };
