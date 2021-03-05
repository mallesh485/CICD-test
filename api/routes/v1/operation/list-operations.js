/**
 * Fetches all the records from the collection
 * @param {*} db - DB object of Firestore.
 * @param {*} constants - Configurable constants for application.
 */
module.exports.listOperations = (db, constants) => {
  return async (req, res, next) => {
    try {
      let limit = constants.defaultLimit;
      let skip = 0;
      if (req.query && req.query.limit && req.query.page) {
        limit = req.query.limit;
        skip = (req.query.page - 1) * limit;
      }
      const query = db
        .collection(constants.firestore.collection)
        .where(
          "createdBy",
          "==",
          req.headers["x-user-email"].toLowerCase().trim()
        );
      const querySnapshot = await query
        .orderBy("createdAt", "desc")
        .offset(parseInt(skip))
        .limit(parseInt(limit))
        .get();
      const data = [];
      querySnapshot.forEach((doc) => {
        const document = {
          id: doc.id,
          operation: doc.data(),
        };
        data.push(document);
      });
      if (data.length <= 0) {
        return res.status(404).json({ message: "No data found." });
      }
      return res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  };
};
