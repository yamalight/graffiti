const fs = require('fs/promises');
const path = require('path');
const _ = require('lodash');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const { schemaComposer } = require('graphql-compose');
const { buildModel } = require('./mongoose');
const { model } = require('mongoose');

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

  return modelTC;
};

const createRelations = async ({ tcs, relationsSetup }) => {
  await relationsSetup?.({ tcs });
};

exports.buildSchema = async () => {
  const workFolder = process.cwd();
  const schemaFolder = path.join(workFolder, 'schema');

  const models = [];
  const fileList = await fs.readdir(schemaFolder);
  // iterate over files and create graphql type defs
  for (let filename of fileList) {
    const modulePath = path.join(schemaFolder, filename);
    const module = require(modulePath);
    const modelName = _.capitalize(filename.replace(/\.js$/, ''));
    models.push({ module, modelName });
  }

  const tcs = {};
  // iterate over models and create graphql type defs
  for (let model of models) {
    const key = model.modelName.toLowerCase();
    const modelTc = await createGraphQLType({
      modelName: model.modelName,
      schemaDefinition: model.module.schema,
    });
    tcs[key] = modelTc;
  }

  // iterate over files and setup relation
  for (let model of models) {
    await createRelations({ tcs, relationsSetup: model.module.relations });
  }

  const graphqlSchema = schemaComposer.buildSchema();
  return graphqlSchema;
};
