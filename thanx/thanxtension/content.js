class WooProduct {
    constructor(name, sku, price, quantity) {
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.quantity = quantity;
    }
}

class WooClient {
    constructor(name, address, phone, perioxi, perifereia, zip, email) {
        this.name = name;
        this.address = address;
        this.perioxi = perioxi;
        this.zip = zip;
        this.perifereia = perifereia;
        this.phone = phone;
        this.email = email;
    }
}

class WooOrder {
    constructor(client, orderid, date, products, shipping, payment, extra, total, comment, shop) {
        this.client = client;
        this.orderid = orderid;
        this.date = date;
        this.products = products;
        this.shipping = moneyFormat(shipping);
        let subtotal = parseFloat(total) - parseFloat(shipping);
        this.subtotal = moneyFormat(subtotal);
        this.total = moneyFormat(total);
        this.comment = comment;
        this.shop = shop;
        this.payment = payment;
        this.extra = moneyFormat(extra);
    }
}

function moneyFormat(money) {
    let temp = money;
    temp = parseFloat(temp)
    temp = temp.toFixed(2);
    temp = temp.toString();
    return temp;
}

function extractNum(str) {
    let temp = str.trim();
    temp = temp.match(/\d/g);
    temp = temp.join('');
    return temp
}

function getShop() {
    let shop = window.location.href;
    if (shop.includes('familystore')) {
        return 'familystore';
    } else if (shop.includes('kidstoys')) {
        return 'kidstoys';
    } else if (shop.includes('homeone')) {
        return 'homeone';
    } else {
        return null;
    }
}

function getClient() {
    let container = Array.from(document.querySelector('div.order_data_column_container').querySelectorAll('div.order_data_column'));
    let billingAddress;
    container.forEach(function(el) {
        let h3 = el.querySelector('h3');
        if (h3.innerText.includes('Χρέωση')) {
            billingAddress = el;
        }
    })
    let data = billingAddress.querySelectorAll('div.address p');
    let someData = data[0].innerHTML.toString().split('<br>');
    let email = data[1].querySelector('a').innerText;
    let phone = data[2].querySelector('a').innerText;
    let client = new WooClient(someData[0], someData[1], phone, someData[2], someData[3], someData[4], email)
    return client
}

function formatDate(date) {
    let temp = '';
    let months = ['', 'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαϊου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
    temp = date.split('-');
    let month = parseInt(temp[1]);
    month = months[month];
    temp = temp[2] + ' ' + month + ' ' + temp[0];
    return temp;
}

function getProducts() {
    let container = Array.from(document.querySelector('#order_line_items').querySelectorAll('tr.item'))
    let products = [];
    container.forEach(function(pRow) {
        let name = pRow.querySelector('a.wc-order-item-name').innerText;
        let sku = pRow.querySelector('div.wc-order-item-sku').innerText;
        let price = pRow.querySelector('td.item_cost').getAttribute('data-sort-value').trim();
        let quantity = pRow.querySelector('td.quantity div.view').innerText.trim();
        quantity = extractNum(quantity);
        let temp = new WooProduct(name, sku, price, quantity);
        products.push(temp)
    })
    return products;
}

function extractOrderData() {
    let shop = getShop();
    let orderid = window.location.href.split('post=')[1].split('&')[0];
    let client = getClient();
    let products = getProducts();
    let shipping = document.querySelector('#order_shipping_line_items td.line_cost').innerText.replace('€', '').trim();
    let date = document.querySelector('.date-picker.hasDatepicker').getAttribute('value').trim();
    date = formatDate(date);

    let extra = '0';
    try {
        extra = document.querySelector('#order_fee_line_items td.line_cost').innerText.replace('€', '').trim();
    } catch (error) {
        extra = '0';
    }
    let payment = document.querySelector('p.woocommerce-order-data__meta.order_number').innerText.split('.')[0];
    let comment = '';
    try {
        comment = document.querySelector('div.order_data_column_container p.order_note').innerText.replace('Σημείωμα από τον πελάτη:', '');
    } catch (error) {
        comment = '';
    }
    let total = document.querySelectorAll('table.wc-order-totals tr');
    let trueTotal = 0;
    total = Array.from(total);
    total.forEach(function(pRow) {
        if (pRow.querySelector('td.label').innerText.includes('Σύνολο')) {
            trueTotal = pRow.querySelector('td.total').innerText.replace('€', '').trim();
        }

    })


    let order = new WooOrder(client, orderid, date, products, shipping, payment, extra, trueTotal, comment, shop);
    return order

}

function isWooOrder() {
    let printButton = document.querySelector('.print-actions');
    if (printButton != null) {
        printButton = document.querySelector('a');
    }
    let title = document.querySelector('h1.wp-heading-inline');
    if (title != null && printButton != null && getShop() != null) {
        if (title.textContent.includes('Παραγγελίας')) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

function stringify(data) {
    let string = JSON.stringify(data)
    let temp = 'https://hardcore-bartik-7edab4.netlify.app/order?'
    string = temp + encodeURI(string);
    return string
}

var b = isWooOrder();
if (b) {
    var printButton = document.querySelector('.print-actions');
    if (printButton != null) {
        printButton = printButton.querySelector('a');
    }
    customButton = document.createElement('a');
    customButton.classList = ['button print-preview-button invoice'];
    customButton.setAttribute("target", '_blank');
    customButton.innerText = 'Thanx Invoice';
    document.querySelector('.print-actions').appendChild(customButton);
    customButton.addEventListener('click', function(event) {
        event.preventDefault();
        let data = extractOrderData();
        let url = stringify(data);
        customButton.setAttribute("href", url);
        window.open(url, '_blank');
    })
}