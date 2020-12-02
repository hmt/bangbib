export const focus = node => node.focus();
export const group_by = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    return result;
  }, {});
};
export const chunk = (arr, size) =>
  arr.reduce(
    (chunks, el, i) =>
      (i % size ? chunks[chunks.length - 1].push(el) : chunks.push([el])) &&
      chunks,
    []
  );
export const sort_by_name = (a, b) => {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
}
export const sql = (strings, ...expr) =>
  strings
    .map((str, index) => str + (expr.length > index ? String(expr[index]) : ''))
    .join('')
