exports.createRelations = async ({ typedefs, model }) => {
  // if user has defined custom relations resolution - use it
  if (model.relations) {
    await model.relations({ typedefs });
    return;
  }

  // get current model key
  const key = model.name.toLowerCase();

  // otherwise go through model properties and try to figure out
  // which fields need to be linked using basic resolvers
  const props = Object.keys(model.schema);
  for (let prop of props) {
    const propDef = model.schema[prop];
    // find properties that use ObjectId as typedef
    if (propDef?.type === 'ObjectId') {
      // get target collection
      const target = propDef?.ref?.toLowerCase();
      // skip if no target is specified
      if (!target) {
        continue;
      }

      const sourceTC = typedefs[key];
      const targetTC = typedefs[target];

      // remove existing field type
      sourceTC.removeField(prop);
      // add new field with same name as relation
      sourceTC.addRelation(prop, {
        resolver: () => targetTC.getResolver('findById'),
        prepareArgs: {
          _id: (source) => source[prop],
        },
        projection: { [prop]: 1 },
      });
    }
  }
};
