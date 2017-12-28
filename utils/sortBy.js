export function sortBy(entity, sortKey, direction = 'desc') {
  return entity.sort((a, b) => {
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
}

export function sortByAttribute(entity, attributeKey, direction = 'desc') {
  return entity.sort((a, b) => {
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
}
