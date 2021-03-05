class MockFirestore {
  constructor(mockData) {
    this.data = mockData;
    this.mockDocument = { id: "", data: () => null };
    return this;
  }

  collection() {
    return this;
  }

  doc(id) {
    if (this.data instanceof Array)
      this.data = this.data.filter((d) => d.id === id).pop();
    else this.data = this.mockDocument;
    return this;
  }

  where() {
    return this;
  }

  orderBy() {
    return this;
  }

  limit() {
    return this;
  }

  offset() {
    return this;
  }

  get() {
    return this.data;
  }

  static add() {
    return {
      id: "test",
    };
  }
}

module.exports = MockFirestore;
