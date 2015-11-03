function truncateDecimals(num, decimals = 2) {
    if (typeof num === 'undefined' || num === null) { return '-'; }

    num = num.toString();
    decimals = parseInt(decimals, 10);

    if (num.indexOf('.') === -1) {
        return num;
    }

    return num.slice(0, (num.indexOf('.')) + (decimals + 1));
}

export default { truncateDecimals };