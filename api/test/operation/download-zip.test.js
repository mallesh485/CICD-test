const constants = require("../../config/constants");
const { downloadZip } = require("../../routes/v1/operation/download-zip");
const mockData = require("../../mocks");
const MockFirestore = require("../../mocks/firestore.mock");
const {
  mockRequest,
  mockResponse,
  mockNext,
} = require("../../mocks/request-response.mock");

const testEmail = "test@gmail.com";

describe("Download ZIP API", () => {
  it("Operation Completed: Get ZIP file", () => {
    const db = new MockFirestore(mockData);
    const handler = downloadZip(db, constants);
    let filePath = "";
    const params = {
      operationId: "JyhalsHMH18AZ2zbFxLD",
    };
    for (const d of mockData) {
      if (d.id === params.operationId) {
        filePath = "./agent/";
      }
    }
    const req = mockRequest({ userEmail: testEmail, params });
    const res = mockResponse();
    return expect(handler(req, res, mockNext)).resolves.toMatchObject(filePath);
  });

  it("Invalid operation ID", () => {
    const db = new MockFirestore();
    const handler = downloadZip(db, constants);
    const params = {
      operationId: "abc",
    };
    const req = mockRequest({ userEmail: testEmail, params });
    const res = mockResponse();
    return expect(handler(req, res, mockNext)).resolves.toMatchObject({
      status: 400,
    });
  });

  it("Operation pending status", () => {
    const db = new MockFirestore(mockData);
    const handler = downloadZip(db, constants);
    const params = {
      operationId: "JyhalsHMH18AZ2zbFxLP",
    };
    const req = mockRequest({ userEmail: testEmail, params });
    const res = mockResponse();
    return expect(handler(req, res, mockNext)).resolves.toMatchObject({
      status: 400,
      operationStatus: "PENDING",
    });
  });
});
