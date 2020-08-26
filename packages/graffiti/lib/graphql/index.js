const { readdir } = require('fs/promises');
const { schemaComposer } = require('graphql-compose');
const capitalize = require('lodash/capitalize');
const { join } = require('path');
const { createGraphQLType } = require('./createType');
const { createRelations } = require('./createRelations');

exports.buildSchema = async () => {
  // get current work folder
  const workFolder = process.cwd();
  // construct path to schema folder
  const schemaFolder = join(workFolder, 'schema');

  // create array to hold new models
  const models = [];
  // get list of files in schema folder
  const fileList = await readdir(schemaFolder);
  // iterate over files and create graphql type defs
  for (let filename of fileList) {
    // create module path from filename
    const modulePath = join(schemaFolder, filename);
    // require given path
    const { schema, relations } = require(modulePath);
    // derive module name from filename
    const name = capitalize(filename.replace(/\.js$/, ''));
    // push info into models list
    models.push({ name, schema, relations });
  }

  // create new name->modelTC mapping
  const tcs = {};
  // iterate over models and create graphql type defs
  for (let model of models) {
    // create key to store resulting model
    const key = model.name.toLowerCase();
    // create new graphql typedef
    const modelTc = createGraphQLType(model);
    // store it
    tcs[key] = modelTc;
  }

  // iterate over models and setup relation
  for (let model of models) {
    await createRelations({ tcs, model });
  }

  const graphqlSchema = schemaComposer.buildSchema();
  return graphqlSchema;
};
