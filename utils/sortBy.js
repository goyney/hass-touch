export function sortBy(entity, sortKey, direction = 'desc') {
  const entityType = typeof entity;
  if (entityType === 'object') {
    entity = Object.entries(entity);
  }

  const sortedArray = entity.sort((a, b) => {
    if (entityType === 'object') {
      a = a[1];
      b = b[1];
    }

    const aName = a[sortKey].toUpperCase();
    const bName = b[sortKey].toUpperCase();

    if (aName < bName) {
      return direction === 'desc' ? -1 : 1;
    }
    if (aName > bName) {
      return direction === 'desc' ? 1 : -1;
    }
    return 0;
  });

  return sortedArray.reduce((sortedObject, values) => {
    sortedObject[values[0]] = values[1];
    return sortedObject;
  }, {});
}

export function sortByAttribute(entity, attributeKey, direction = 'desc') {
  const entityType = typeof entity;
  if (entityType === 'object') {
    entity = Object.entries(entity);
  }

  const sortedArray = entity.sort((a, b) => {
    if (entityType === 'object') {
      a = a[1];
      b = b[1];
    }

    const aName = a.attributes[attributeKey].toUpperCase();
    const bName = b.attributes[attributeKey].toUpperCase();

    if (aName < bName) {
      return direction === 'desc' ? -1 : 1;
    }
    if (aName > bName) {
      return direction === 'desc' ? 1 : -1;
    }
    return 0;
  });

  return sortedArray.reduce((sortedObject, values) => {
    sortedObject[values[0]] = values[1];
    return sortedObject;
  }, {});
}
