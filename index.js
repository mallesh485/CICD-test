const Firestore = require("@google-cloud/firestore");
let admin = require('firebase-admin');
const FieldValue = admin.firestore.FieldValue;

const db = new Firestore({
    projectId: 'qai-bd-qa'
  });

exports.progressUpdate = async(event,context) => {

    const pubsubmsg = event.data;
    
    console.log(Buffer.from(pubsubmsg,'base64').toString())
    let data = JSON.parse(Buffer.from(pubsubmsg,'base64').toString())
    // console.log(data.length, JSON.parse(data))
    // console.log(data)
    for (let index = 0; index < data['key'].length; index++) {
       let docRef = db.collection('bot-translator').doc(data['operationId'])
       let time = Date.now()
        let update =await docRef.update({
          [data['key'][index]] : data['value'][index],
          'updatedAt' :  time
     });  

      
    }
    
    let time = (Date.now()).toString()
    const eventRef = db.collection('bot-translator').doc(data['operationId']).collection('events').doc(time)
   
    // let eventData = {'message':data['event'],'timestamp': time}
    const unionRes = await eventRef.set({
      message: data['event']
    })
    // let docRef = db.collection('bot-translator').doc(data['operationId'])
    //     let update = docRef.update({
    //       progress : data['progress']
    //  });
}

// progressUpdate({'progress':'5%'},"")