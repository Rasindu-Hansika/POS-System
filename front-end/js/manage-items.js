$("#tbl-products tbody").empty();

const tbodyElm = $("#tbl-products tbody");
const modalElm = $("#new-product-modal");
const txtCode = $("#txt-code");
const txtDescription = $("#txt-description");
const txtQuantity = $("#txt-quantity");
const txtPrice = $("#txt-price");
const btnSave = $("#btn-save");

function formatCode(code){
    return `I${code.toString().padStart(3,"0")}`
}
modalElm.on("show.bs.modal", () => {
    setTimeout(() => {
        txtDescription.trigger("focus");
    }, 500);
    resetForm(true);
    txtCode.parent().hide();
});

[txtDescription, txtQuantity, txtPrice].forEach((txtElm) => $(txtElm).addClass("animate__animated"));

btnSave.on("click", () => {
    if (!validateData()) {
        return false;
    }
    const code = txtCode.val().trim();
    const description = txtDescription.val().trim();
    const quantity = txtQuantity.val().trim();
    const price = txtPrice.val().trim();

    let product = {description, quantity, price}
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
            [txtCode,txtDescription,txtQuantity,txtPrice,btnSave].forEach(txt=>{
                txt.removeAttr('disabled');
            })
            $('#loader').css('visibility', 'hidden');
            if (xhr.status === 201) {
                product= JSON.parse(xhr.responseText);
                getProducts();
                resetForm(true);
                txtDescription.trigger("focus");
                showToast("success", "Success", "Product has been saved successfully");
            } else {
                const errorObj = JSON.parse(xhr.responseText);
                showToast("error", 'Failed', errorObj.message);

            }
        }
    });
    xhr.open("POST", 'http://localhost:8080/pos/products', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    progressBar(xhr);
    xhr.send(JSON.stringify(product));
    [txtCode,txtDescription,txtQuantity,txtPrice,btnSave].forEach(txt=>{
        txt.attr('disabled', 'true');
    })
    $('#loader').css('visibility', 'visible');



});

function validateData() {
    const price = txtPrice.val().trim();
    const quantity = txtQuantity.val().trim();
    const description = txtDescription.val().trim();
    resetForm(false);

    let valid = true;

    if (!price) {
        valid = inValidate(txtPrice, "Price can't be Empty");
    } else if (!/^[\d.]+$/.test(price)) {
        valid = inValidate(txtPrice, "Invalid Price");
    }

    if (!quantity) {
        valid = inValidate(txtQuantity, "Quantity can't be Empty");
    } else if (!/^\d+$/.test(quantity)) {
        valid = inValidate(txtQuantity, "Invalid Quantity");
    }
    if (!description) {
        valid = inValidate(txtDescription, "Description can't be Empty");
    } else if (!/^[A-Za-z ]+$/.test(description)) {
        valid = inValidate(txtDescription, "Invalid Description");
    }
    return valid;
}

function inValidate(txt, msg) {
    setTimeout(() => {
        txt.addClass("is-invalid animate__shakeX");
    }, 0);
    txt.select();
    txt.next().text(msg);
    return false;
}

function resetForm(clearData) {
    [txtDescription, txtQuantity, txtPrice].forEach((elm) => {
        elm.removeClass("is-invalid animate__shakeX");
        if (clearData) elm.val("");
    });
}

function createRow(product) {
    tbodyElm.append(`
    <tr>
    <td class="text-center">${formatCode(product.code)}</td>
    <td>${product.description}</td>
    <td class="d-none d-xl-table-cell">${product.quantity}</td>
    <td class="contact text-center">${product.price}</td>
    <td>
        <div class="actions d-flex gap-3 justify-content-center">
            <svg data-bs-toggle="tooltip" data-bs-title="Edit Customer" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                class="bi bi-pencil-square edit" viewBox="0 0 16 16">
                <path
                    d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                <path fill-rule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
            </svg>
            <svg data-bs-toggle="tooltip" data-bs-title="Delete Customer" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                class="bi bi-trash delete" viewBox="0 0 16 16">
                <path
                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                <path
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
            </svg>
        </div>
    </td>
</tr>
    `);
}

function showToast(type, header, body) {
    $("#toast .toast").removeClass('text-bg-danger text-bg-primary text-bg-warning')
    switch (type) {
        case "success":
            $("#toast .toast").addClass("text-bg-primary");
            break;
        case "warning":
            $("#toast .toast").addClass("text-bg-warning");
            break;
        case "error":
            $("#toast .toast").addClass("text-bg-danger");
            break;
    }

    $("#toast .toast-header > strong").text(header);
    $("#toast .toast-body").text(body);
    $("#toast .toast").toast("show");
}

const txtSearch = $("#txt-search");
function getProducts() {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                tbodyElm.empty();
                const productList = JSON.parse(xhr.responseText);
                productList.forEach(product => {
                    createRow(product)
                });
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
                const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
                if (productList.length) {
                    $("#tbl-products tfoot").hide();
                } else {
                    $("#tbl-products tfoot").show();
                }
            } else {
                tbodyElm.empty();
                $("tbl-products tfoot").show();
                showToast('error', "Failed", "Failed to fetch data");
                console.log(JSON.parse(xhr.responseText));
            }
        }
    });
    const query = (txtSearch.val().trim()) ? `?q=${txtSearch.val().trim()}` : "";
    xhr.open("GET", "http://localhost:8080/pos/products" + query, true);
    const tfoot =$('#tbl-customers tfoot tr td:first-child');
    xhr.addEventListener('loadstart', () => tfoot.text('Please Wait!'));
    xhr.addEventListener('loadend', () => tfoot.text('No Customer Records are found'));
    xhr.send();
}

getProducts();

txtSearch.on('input', () => {
    getProducts()
});

function progressBar(xhr) {
    const bar = $('#progressbar');
    xhr.addEventListener('loadstart', () => bar.width('0%'));
    xhr.addEventListener('progress', (eventData) => {
        const downloadedByes = eventData.loaded;
        const totalBytes = eventData.total;
        const progress = downloadedByes / totalBytes * 100;
        bar.width(`${progress}`);
    });

    xhr.addEventListener('loadend', () => {
        bar.width('100%');
        setTimeout(() => bar.width('0%'), 500)
    });

}

tbodyElm.on('click', '.delete', (eventData) => {
    const code = +$(eventData.target).parents("tr").children('td:first-child').text().replace('I', "");
    const xhr = new XMLHttpRequest();
    const jqxhr = $.ajax(`http://localhost:8080/pos/products/${code}`, {method: 'DELETE',xhr:()=> xhr});
    progressBar(xhr);
    jqxhr.done(()=>{
        showToast('success', "Deleted", "Product deleted successfully");
        $(eventData.target).tooltip('dispose');
        getProducts();
    })
    jqxhr.fail(()=>{
        showToast('error', "Failed", "Failed to delete the product try again");

    })


})