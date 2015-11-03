function getAverage(arr) {
    return getSum(arr) / arr.length;
}

function getSum(arr) {
    var sum = 0,
        val;

    for (val of arr) {
        sum += val;
    }

    return sum;
}

export default { getAverage, getSum };