function getSortedKeys(object) {
    return Object.keys(object).sort(function (a, b) {
        a = object[a];
        b = object[b];

        return a > b ? 1 : -1;
    });
}

export default { getSortedKeys };