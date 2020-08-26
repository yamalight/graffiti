const fs = require('fs/promises');
const path = require('path');
const _ = require('lodash');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const { schemaComposer } = require('graphql-compose');
const { buildModel } = require('./mongoose');

// CONVERT MONGOOSE MODEL TO GraphQL PIECES
const customizationOptions = {}; // left it empty for simplicity, described below

const createGraphQLType = async ({ schemaDefinition, modelName }) => {
  const mongoModel = buildModel({ schemaDefinition, modelName });
  const modelTC = composeWithMongoose(mongoModel, customizationOptions);

  // generate prefix based on model name
  const prefix = modelName.toLowerCase();

  // default queries
  const queries = {
    [`${prefix}ById`]: modelTC.getResolver('findById'),
    [`${prefix}ByIds`]: modelTC.getResolver('findByIds'),
    [`${prefix}One`]: modelTC.getResolver('findOne'),
    [`${prefix}Many`]: modelTC.getResolver('findMany'), // .debug(), // debug info to console for this resolver
    [`${prefix}Total`]: modelTC.getResolver('count'),
    [`${prefix}Connection`]: modelTC.getResolver('connection'),
    [`${prefix}Pagination`]: modelTC.getResolver('pagination'),
  };
  // register queries using composer
  schemaComposer.Query.addFields(queries);

  // default mutations
  const mutations = {
    [`${prefix}Create`]: modelTC.getResolver('createOne'),
    [`${prefix}CreateMany`]: modelTC.getResolver('createMany'),
    [`${prefix}UpdateById`]: modelTC.getResolver('updateById'),
    [`${prefix}UpdateOne`]: modelTC.getResolver('updateOne'),
    [`${prefix}UpdateMany`]: modelTC.getResolver('updateMany'),
    [`${prefix}RemoveById`]: modelTC.getResolver('removeById'),
    [`${prefix}RemoveOne`]: modelTC.getResolver('removeOne'),
    [`${prefix}RemoveMany`]: modelTC.getResolver('removeMany'),
  };
  // register mutations using composer
  schemaComposer.Mutation.addFields(mutations);
};

exports.buildSchema = async () => {
  const workFolder = process.cwd();
  const schemaFolder = path.join(workFolder, 'schema');

  const fileList = await fs.readdir(schemaFolder);
  for (filename of fileList) {
    const modulePath = path.join(schemaFolder, filename);
    const module = require(modulePath);
    const modelName = _.capitalize(filename.replace(/\.js$/, ''));
    await createGraphQLType({ modelName, schemaDefinition: module.schema });
  }

  const graphqlSchema = schemaComposer.buildSchema();
  return graphqlSchema;
};
