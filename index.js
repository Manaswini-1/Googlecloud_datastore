
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();
const getKeyFromRequestData = requestData => {
  if (!requestData.key) {
    return Promise.reject(makeErrorObj('Key'));
  }

  if (!requestData.kind) {
    return Promise.reject(makeErrorObj('Kind'));
  }

  return datastore.key([requestData.kind, requestData.key]);
};


exports.write = async (req, res) => {
  if (!req.body.value) {
    const err = makeErrorObj('Value');
    console.error(err);
    res.status(500).send(err.message);
    return;
  }

  try {
    const key = await getKeyFromRequestData(req.body);
    const entity = {
      key: key,
      data: req.body.value,
    };

    await datastore.save(entity);
    res.status(200).send(`Successfully ${key.path.join('/')} records inserted.`);
  } catch (err) {
    console.error(new Error(err.message)); 
    res.status(500).send(err.message);
  }
}

exports.read = async (req, res) => {
  try {
    const key = await getKeyFromRequestData(req.body);
    const [entity] = await datastore.get(key);

    
    if (!entity) {
      throw new Error(`No entity found for key ${key.path.join('/')}.`);
    }

    res.status(200).send(entity);
  } catch (err) {
    console.error(new Error(err.message)); 
    res.status(500).send(err.message);
  }
};
