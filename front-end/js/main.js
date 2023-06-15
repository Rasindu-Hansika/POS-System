
(() => {
    'use strict'
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })
  })()

export function progressBar(xhr) {
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

export function showToast(type, header, body) {
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
export function formatPrice(number) {
    return new Intl.NumberFormat("en-LK", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}