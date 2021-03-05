const Firestore = require("@google-cloud/firestore");
let admin = require('firebase-admin');
const db = admin.firestore();
const collection = 'bot-translator';

exports.progressUpdate = async(event,context) => {

    try {
      const pubsubmsg = event.data;
    
      let data = JSON.parse(Buffer.from(pubsubmsg,'base64').toString())
      for (let index = 0; index < data['key'].length; index++) {
        let docRef = db.collection(collection).doc(data['operationId'])
        let time = Date.now()
          let update =await docRef.update({
            [data['key'][index]] : data['value'][index],
            'updatedAt' :  time
      });  

        
      }
      
      let time = (Date.now()).toString()
      const eventRef = db.collection(collection).doc(data['operationId']).collection('events').doc(time)
    
      await eventRef.set({
        message: data['event']
      })
    } catch (error) {
      console.log(error);
    }
}
