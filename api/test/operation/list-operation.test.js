const constants = require("../../config/constants");
const { listOperations } = require("../../routes/v1/operation/list-operations");
const mockData = require("../../mocks");
const MockFirestore = require("../../mocks/firestore.mock");
const {
  mockRequest,
  mockResponse,
  mockNext,
} = require("../../mocks/request-response.mock");

const testEmail = "test@gmail.com";

describe("list all operations API", () => {
  const db = new MockFirestore(mockData);
  const handler = listOperations(db, constants);
  it("get all operations", () => {
    const mockOperations = [];
    for (const d of mockData) {
      mockOperations.push({ id: d.id, operation: d.data() });
    }
    const req = mockRequest({ userEmail: testEmail });
    const res = mockResponse();
    return expect(handler(req, res, mockNext)).resolves.toEqual(mockOperations);
  });
});
