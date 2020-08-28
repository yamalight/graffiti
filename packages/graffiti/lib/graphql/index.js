const { readdir } = require('fs/promises');
const { schemaComposer } = require('graphql-compose');
const { join } = require('path');
const { buildModel } = require('../mongoose');
const { createGraphQLType } = require('./createType');
const { createRelations } = require('./createRelations');

exports.buildSchema = async ({ db }) => {
  // get current work folder
  const workFolder = process.cwd();
  // construct path to schema folder
  const schemaFolder = join(workFolder, 'schema');

  // create array to hold new models
  const models = [];
  // get list of files in schema folder
  const fileList = await readdir(schemaFolder);
  // iterate over files and create graphql type defs
  for (const filename of fileList) {
    // create module path from filename
    const modulePath = join(schemaFolder, filename);
    // require given path
    const { schema, relations } = require(modulePath);
    // derive module name from filename
    const name = filename.replace(/\.js$/, '');
    // push info into models list
    models.push({ name, schema, relations });
  }

  // create new name->modelTC mapping
  const typedefs = {};
  // create new name->mongo model mappings
  const mongoModels = {};
  // iterate over models and create graphql type defs
  for (const model of models) {
    // create key to store resulting model
    const key = model.name.toLowerCase();
    // create mongo model
    const mongoModel = buildModel({
      db,
      schema: model.schema,
      name: model.name,
    });
    // create new graphql typedef
    const modelTc = createGraphQLType({ mongoModel, name: model.name });
    // store model and typedef
    typedefs[key] = modelTc;
    mongoModels[key] = mongoModel;
  }

  // iterate over models and setup relation
  for (const model of models) {
    await createRelations({ typedefs, model });
  }

  const graphqlSchema = schemaComposer.buildSchema();
  return graphqlSchema;
};
