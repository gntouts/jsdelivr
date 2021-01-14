document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(null, function(tab) {
        let currUrl = tab.url;
        let title = tab.title;
        let data = { 'shop': -1, 'orderid': -1 };
        if (title.includes('Παραγγελίας')) {
            let orderId = currUrl.split('?post=')[1];
            orderId = orderId.split('&')[0];
            data['orderid'] = orderId;
            if (currUrl.includes('homeone')) {
                data['shop'] = 'Homeone';
            } else if (currUrl.includes('kidstoys')) {
                data['shop'] = 'Kidstoys';
            } else if (currUrl.includes('familystore')) {
                data['shop'] = 'Familystore';
            }
        }
        if (data['shop'] != -1 && data['orderid'] != -1) {
            document.getElementById('result').innerText = 'Valid page!';
        } else {
            document.getElementById('result').innerText = 'Invalid: Please click while having an open order!';
        }


    });
}, false);