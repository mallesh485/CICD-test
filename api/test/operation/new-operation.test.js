const constants = require("../../config/constants");
const { newOperation } = require("../../routes/v1/operation/new-operation");
const MockFirestore = require("../../mocks/firestore.mock");
const {
  mockRequest,
  mockResponse,
  mockNext,
} = require("../../mocks/request-response.mock");

const testEmail = "test@quantiphi.com";

describe("New operation API", () => {
  const db = new MockFirestore([]);
  const handler = newOperation(db, constants);
  it("should create new operation", () => {
    const reqBody = {
      name: "test",
      srcLanguageCode: "en",
      targetLanguageCode: "es",
    };
    const file = {
      originalname: "test-file.zip",
    };
    const req = mockRequest({ userEmail: testEmail, body: reqBody, file });
    const res = mockResponse();
    return expect(handler(req, res, mockNext)).resolves.toMatchObject({
      message: "New job started successfully",
    });
  });

  it("should fail to create operation with invalid request body", () => {
    const reqBody = {
      name: "test",
      srcLanguageCode: "en",
    };
    const req = mockRequest({ userEmail: testEmail, body: reqBody });
    const res = mockResponse();
    return expect(handler(req, res, mockNext)).resolves.toMatchObject({
      status: 400,
      message:
        "Error in request body, please check details to find all errors.",
    });
  });
});
