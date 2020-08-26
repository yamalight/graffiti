const { schemaComposer } = require('graphql-compose');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const { buildModel } = require('../mongoose');

// graphql-compose options
const customizationOptions = {};

exports.createGraphQLType = ({ schema, name }) => {
  const mongoModel = buildModel({ schema, name });
  const modelTC = composeWithMongoose(mongoModel, customizationOptions);

  // generate prefix based on model name
  const prefix = name.toLowerCase();

  // default queries
  const queries = {
    [`${prefix}ById`]: modelTC.getResolver('findById'),
    [`${prefix}ByIds`]: modelTC.getResolver('findByIds'),
    [`${prefix}One`]: modelTC.getResolver('findOne'),
    [`${prefix}Many`]: modelTC.getResolver('findMany'),
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
