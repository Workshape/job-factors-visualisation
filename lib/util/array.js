function getAverage(arr) {
    var sum = 0,
        val;

    for (val of arr) {
        sum += val;
    }

    return sum / arr.length;
}

export default { getAverage };