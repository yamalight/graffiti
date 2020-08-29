const { schemaComposer } = require('graphql-compose');
const { composeWithMongoose } = require('graphql-compose-mongoose');

// graphql-compose options
const customizationOptions = {};

exports.createGraphQLType = ({ mongoModel, config, name }) => {
  const modelTC = composeWithMongoose(mongoModel, customizationOptions);

  // generate prefix based on model name
  const prefix = name.toLowerCase();

  // determine whether we need to create mutations based on model config
  const createQueries = config?.defaults?.queries !== false;
  if (createQueries) {
    // default queries
    const queries = {};
    // add queries if they are not explicitly disabled
    if (config?.defaults?.queries?.byId !== false) {
      queries[`${prefix}ById`] = modelTC.getResolver('findById');
    }
    if (config?.defaults?.queries?.byIds !== false) {
      queries[`${prefix}ByIds`] = modelTC.getResolver('findByIds');
    }
    if (config?.defaults?.queries?.one !== false) {
      queries[`${prefix}One`] = modelTC.getResolver('findOne');
    }
    if (config?.defaults?.queries?.many !== false) {
      queries[`${prefix}Many`] = modelTC.getResolver('findMany');
    }
    if (config?.defaults?.queries?.total !== false) {
      queries[`${prefix}Total`] = modelTC.getResolver('count');
    }
    if (config?.defaults?.queries?.connection !== false) {
      queries[`${prefix}Connection`] = modelTC.getResolver('connection');
    }
    if (config?.defaults?.queries?.pagination !== false) {
      queries[`${prefix}Pagination`] = modelTC.getResolver('pagination');
    }
    // register queries using composer
    schemaComposer.Query.addFields(queries);
  }

  // determine whether we need to create mutations based on model config
  const createMutations = config?.defaults?.mutations !== false;
  if (createMutations) {
    // default mutations
    const mutations = {};
    // add queries if they are not explicitly disabled
    if (config?.defaults?.mutations?.create !== false) {
      mutations[`${prefix}Create`] = modelTC.getResolver('createOne');
    }
    if (config?.defaults?.mutations?.createMany !== false) {
      mutations[`${prefix}CreateMany`] = modelTC.getResolver('createMany');
    }
    if (config?.defaults?.mutations?.updateById !== false) {
      mutations[`${prefix}UpdateById`] = modelTC.getResolver('updateById');
    }
    if (config?.defaults?.mutations?.updateOne !== false) {
      mutations[`${prefix}UpdateOne`] = modelTC.getResolver('updateOne');
    }
    if (config?.defaults?.mutations?.updateMany !== false) {
      mutations[`${prefix}UpdateMany`] = modelTC.getResolver('updateMany');
    }
    if (config?.defaults?.mutations?.removeById !== false) {
      mutations[`${prefix}RemoveById`] = modelTC.getResolver('removeById');
    }
    if (config?.defaults?.mutations?.removeOne !== false) {
      mutations[`${prefix}RemoveOne`] = modelTC.getResolver('removeOne');
    }
    if (config?.defaults?.mutations?.removeMany !== false) {
      mutations[`${prefix}RemoveMany`] = modelTC.getResolver('removeMany');
    }
    // register mutations using composer
    schemaComposer.Mutation.addFields(mutations);
  }

  return modelTC;
};
