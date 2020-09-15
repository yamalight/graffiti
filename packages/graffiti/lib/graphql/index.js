const { readdir } = require('fs/promises');
const { schemaComposer } = require('graphql-compose');
const { join } = require('path');
const { buildModel } = require('../mongoose');
const { createGraphQLType } = require('./createType');
const { createRelations } = require('./createRelations');

exports.buildSchema = async ({ db, plugins, projectConfig }) => {
  // get current work folder
  const workFolder = process.cwd();
  // construct path to schema folder
  const schemaFolder = join(workFolder, projectConfig.basePath);

  // create array to hold new models
  const models = [];
  // get list of files in schema folder
  const fileList = await readdir(schemaFolder);
  // iterate over files and create graphql type defs
  for (const filename of fileList) {
    // create module path from filename
    const modulePath = join(schemaFolder, filename);
    // require given path
    const {
      schema,
      config,
      relations,
      resolvers,
      compose,
    } = require(modulePath);
    // derive module name from filename
    const name = filename.replace(/\.js$/, '');
    // push info into models list
    models.push({ name, config, schema, relations, resolvers, compose });
  }

  // iterate over plugins and create graphql type defs if given
  for (const plugin of plugins) {
    // if plugin doesn't export schemas - just skip it
    if (!plugin.schemas?.length) {
      continue;
    }
    // iterate over schemas exported from plugin
    for (const pluginSchema of plugin.schemas) {
      // get data from plugin schema
      const {
        name,
        schema,
        config,
        relations,
        resolvers,
        compose,
      } = pluginSchema;
      // push info into models list
      models.push({ name, config, schema, relations, resolvers, compose });
    }
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
    // create new graphql typedef with default methods and resolvers
    const modelTc = createGraphQLType({
      mongoModel,
      config: model.config,
      name: model.name,
    });
    // apply custom resolvers if needed
    model.resolvers?.({ typedef: modelTc, model: mongoModel });
    // compose custom methods if needed
    model.compose?.({ schemaComposer, typedef: modelTc });
    // store model and typedef
    typedefs[key] = modelTc;
    mongoModels[key] = mongoModel;
  }

  // iterate over models and setup relation
  for (const model of models) {
    await createRelations({ typedefs, model });
  }

  const graphqlSchema = schemaComposer.buildSchema();
  return { graphqlSchema, schemaComposer, typedefs, mongoModels };
};
