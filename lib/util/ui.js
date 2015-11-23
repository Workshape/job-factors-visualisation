function showPopup(url, title) {
    var width = 550,
        height = 300,
        left = (window.innerWidth - width) / 2,
        top = (window.innerHeight - height) / 2;

    window.open(url, title, `left=${left},top=${top},width=${width},height=${height},resizable=1`);
}

export default { showPopup };