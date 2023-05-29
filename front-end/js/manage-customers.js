$("#tbl-customers tbody").empty();

const tbodyElm = $("#tbl-customers tbody");
const modalElm = $("#new-customer-modal");
const txtId = $("#txt-id");
const txtName = $("#txt-name");
const txtContact = $("#txt-contact");
const txtAddress = $("#txt-address");

const btnSave = $("#btn-save");

function formatCustomerId(id) {
    return `C${id.toString().padStart(3, "0")}`;
}


modalElm.on("show.bs.modal", () => {
    setTimeout(() => {
        txtName.trigger("focus");
    }, 500);
    resetForm(true);
    txtId.parent().hide();
});

[txtName, txtContact, txtAddress].forEach((txtElm) => $(txtElm).addClass("animate__animated"));

btnSave.on("click", () => {
    if (!validateData()) {
        return false;
    }
    const id = txtId.val().trim();
    const name = txtName.val().trim();
    const address = txtAddress.val().trim();
    const contact = txtContact.val().trim();

    let customer = {name, contact, address}
    // Todo:Send as request to the server to save the customer
    //1.create a XHR object
    const xhr = new XMLHttpRequest();

    //2.Set an event listener to listen  readyState change
    xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
            [txtId, txtName, txtName, txtAddress, btnSave].forEach(txt => {
                txt.removeAttr('disabled');
            })
            $('#loader').css('visibility', 'hidden');
            if (xhr.status === 201) {
                customer = JSON.parse(xhr.responseText);
                getCustomers();
                resetForm(true);
                txtName.trigger("focus");
                showToast("success", "Success", "Customer has been saved successfully");
            } else {
                const errorObj = JSON.parse(xhr.responseText);
                showToast("error", 'Failed', errorObj.message);

            }
        }
    });

    //3. Let's open the request
    xhr.open("POST", 'http://localhost:8080/pos/customers', true);

    //4.let's Set Headers
    xhr.setRequestHeader('Content-Type', 'application/json');
    progressBar(xhr);
    //5.Sent the Request
    xhr.send(JSON.stringify(customer));

    [txtId, txtName, txtName, txtAddress, btnSave].forEach(txt => {
        txt.attr('disabled', 'true');
    })
    $('#loader').css('visibility', 'visible');


});

function validateData() {
    const address = txtAddress.val().trim();
    const contact = txtContact.val().trim();
    const name = txtName.val().trim();
    resetForm(false);

    let valid = true;

    if (!address) {
        valid = inValidate(txtAddress, "Address can't be Empty");
    } else if (!/.{3,}/.test(address)) {
        valid = inValidate(txtAddress, "Invalid Address");
    }

    if (!contact) {
        valid = inValidate(txtContact, "Contact can't be Empty");
    } else if (!/^\d{3}-\d{7}$/.test(contact)) {
        valid = inValidate(txtContact, "Invalid Contact");
    }
    if (!name) {
        valid = inValidate(txtName, "Name can't be Empty");
    } else if (!/^[A-Za-z ]+$/.test(name)) {
        valid = inValidate(txtName, "Invalid Name");
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
    [txtName, txtContact, txtAddress].forEach((elm) => {
        elm.removeClass("is-invalid animate__shakeX");
        if (clearData) elm.val("");
    });
}

function createRow(customer) {
    tbodyElm.append(`
    <tr>
    <td class="text-center">${formatCustomerId(customer.id)}</td>
    <td>${customer.name}</td>
    <td class="d-none d-xl-table-cell">${customer.address}/td>
    <td class="contact text-center">${customer.contact}</td>
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

function getCustomers() {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                tbodyElm.empty();
                const customerList = JSON.parse(xhr.responseText);
                customerList.forEach(customer => {
                    createRow(customer)
                });
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
                const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
                if (customerList.length) {
                    $("#tbl-customers tfoot").hide();
                } else {
                    $("#tbl-customers tfoot").show();
                }
            } else {
                tbodyElm.empty();
                $("tbl-customers tfoot").show();
                showToast('error', "Failed", "Failed to fetch data");
                console.log(JSON.parse(xhr.responseText));
            }
        }
    });
    const query = (txtSearch.val().trim()) ? `?q=${txtSearch.val().trim()}` : "";
    xhr.open("GET", "http://localhost:8080/pos/customers" + query, true);


    const tfoot = $('#tbl-customers tfoot tr td:first-child');
    xhr.addEventListener('loadstart', () => tfoot.text('Please Wait!'));
    xhr.addEventListener('loadend', () => tfoot.text('No Customer Records are found'));
    xhr.send();
}

getCustomers();

txtSearch.on('input', () => {
    getCustomers()
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
    // XHR-> Jquery AJAX
    /*
    * const jqxhr= $.ajax(url,{
    *                               method:'GET',
    *                               contentType:'application/json',
    *                               data:'request body',
    *                                                   });
    * jqxhr.done((response,status)=>{}); if response is success
    * jqxhr.fail(()=>{}); if response is unsuccessful
    * jqxhr.always(()=>{}); this will work always no matter wht is the response is.
    *
    * */
    const id = +$(eventData.target).parents("tr").children('td:first-child').text().replace('C', "");
    const xhr = new XMLHttpRequest();
    const jqxhr = $.ajax(`http://localhost:8080/pos/customers/${id}`, {method: 'DELETE',xhr:()=>xhr});
    progressBar(xhr);
    jqxhr.done(()=>{
        showToast('success', "Deleted", "customer deleted successfully");
        $(eventData.target).tooltip('dispose');
        getCustomers();
    })
    jqxhr.fail(()=>{
            showToast('error', "Failed", "Failed to delete the customer try again");

        })


})
