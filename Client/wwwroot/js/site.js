$(function () {
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        var $f = $(this);
        $.each(a, function () {
            var v = this.value,
                m = $f?.find('[name="' + this.name + '"]')?.hasClass('money-mask') || $f?.find('[name="' + this.name + '"]')?.hasClass('percentage-mask');
            if (v && m)
                v = parseFloat(ajustarValor(v));

            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(v || '');
            } else {
                o[this.name] = v || '';
            }
        });
        return o;
    };

    $.fn.validate = function () {
        var form = this[0];
        var valid = form.checkValidity();
        form.classList.add('was-validated');
        return valid;
    };

    $.fn.clearValidation = function (event) {
        var form = this[0];
        form.classList.remove('was-validated');
    };
    $.fn.filterData = function (set) {
        var elems = $([]);
        this.each(function (i, e) {
            $.each($(e).data(), function (j, f) {
                if (j.substring(0, set.length) == set) {
                    elems = elems.add($(e));
                }
            });
        });
        return elems;
    }
    $(document).on('show.bs.modal', '.modal', function () {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function () {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });
    $(document).on('hidden.bs.modal', '.modal', function () {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    });
});

function formataCpfCnpj(cpf_cnpj) {
    var doc = cpf_cnpj?.replace(/[^\d]/g, "");
    if (doc.length <= 11)
        doc = doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else
        doc = doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    return doc;
}

async function Request(options, funcSuccess, funcError) {
    if (!options.timeout)
        options.timeout = _api_.timeout;

    if (!options.contentType && options.isFormData != true)
        options.contentType = 'application/json; charset=utf-8'
    else
        options.contentType = false;

    if (!options.dataType)
        options.dataType = 'JSON'

    if (!options.ignoreToken)
        options.ignoreToken = false;

    if (!options.method)
        options.method = 'GET'

    if (options.isFormData != true)
        options.data = JSON.stringify(options.data);

    if (options.async != true && options.async != false)
        options.async = true;

    if (!options.ignoreAlertTimeout)
        options.ignoreAlertTimeout = false;

    if (options._asyncSuccess != true && options.async != false)
        options._asyncSuccess = false;

    if (options.crossDomain == undefined)
        options.crossDomain = true;

    return $.ajax({
        async: options.async,
        crossDomain: options.crossDomain,
        url: options.url,
        data: options.data,
        method: options.method,
        contentType: options.contentType,
        dataType: options.dataType,
        processData: options.isFormData == true ? false : true,
        timeout: options.timeout,
        beforeSend: function (request, settings) {
            if (options.token)
                request.setRequestHeader('Authorization', options.token);
            else if (!options.ignoreToken)
                request.setRequestHeader('Authorization', _api_.token);


            //if ($("#modalLoading").length == 0 && options.NotOpenLoading != true) {
            //    Loading(true);
            //}
        },
        complete: function (jqXHR, textStatus) {
            //if (options.notCloseLoading != true) {
            //    setTimeout(function () {
            //        Loading(false);
            //    }, 200);
            //}
        },
        success: async function (data, textStatus, jqXHR) {
            await funcSuccess(data);
        },
        error: function (response, textStatus) {
            if (response.statusText == 'timeout' && !options.ignoreAlertTimeout)
                console.log('Tempo expirado, tente novamente.');
            else if (response.status == 201 && funcSuccess)
                funcSuccess(response.status);
            else if (response.status == 200 && funcSuccess)
                funcSuccess(response.responseText);
            else if (response.status == 200 && !funcSuccess) {
                return;
            }
            else if (response.statusText != 'timeout') {
                if (!!funcError)
                    funcError(response, textStatus);
                else if (response?.responseJSON?.message || response?.responseJSON?.title)
                    tempAlert(response?.responseJSON?.message || response?.responseJSON?.title, 10000);
                else
                    console.log(response);
            }

            //if (options.notCloseLoading)
            //    Loading(false);
        }
    });
}

function tempAlert(msg, duration) {
    var el = document.createElement("div");
    el.setAttribute("style", "margin: auto auto;width: 400px;height: 400px;position: absolute;top: 0;font-size: 31px;bottom: 0;left: 0;right: 0;font-family: system-ui;");
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
}

function Filtrar(id, table, tipo, col, ativo = 'Ativo', inativo = 'Inativo') {
    $('#' + id + ' .activeBrx').removeClass('activeBrx');
    $('#' + id + ' [data-tipo="' + tipo + '"]').addClass('activeBrx');

    var filtro = '';
    if (tipo == 2)
        filtro = ativo;
    else if (tipo == 3)
        filtro = inativo;

    table.column(col).search(filtro, true, true, false).draw();
}


function Alerta(content, title) {
    if (!title)
        title = 'Alerta!';

    Swal.fire(title, content);
}

function notificacao(message, title, type) {
    if (!type)
        type = 'success';

    if (type == 'success')
        toastr.success(title, message, { "showMethod": "slideDown", "hideMethod": "slideUp", timeOut: 4000 });
    else if (type == 'error')
        toastr.error(title, message, { "showMethod": "slideDown", "hideMethod": "slideUp", timeOut: 4000 });
    else if (type == 'info')
        toastr.info(title, message, { "showMethod": "slideDown", "hideMethod": "slideUp", timeOut: 4000 });
    else if (type == 'warning')
        toastr.warning(title, message, { "showMethod": "slideDown", "hideMethod": "slideUp", timeOut: 4000 });
}

function confirmacao(content, title) {
    return Swal.fire({
        title: !title ? 'Alerta!' : title,
        text: content,
        showCancelButton: true,
        cancelButtonText: 'Não',
        confirmButtonText: 'Sim'
    });
}

function Loading(open) {
    var loading = $(".loading"),
        modal = $('<div id="modalLoading" class="modalLoading"></div>');
    if (open && (loading[0].style.display == 'none' || loading[0].style.display == '')) {
        loading.show();
        $('body').append(modal);
        var top = Math.max($(window).height() / 2 - loading[0].offsetHeight / 2, 0);
        var left = Math.max($(window).width() / 2 - loading[0].offsetWidth / 2, 0);
        loading.css({ top: top, left: left });
    }
    else if (!open && loading[0].style.display == 'block') {
        $('#modalLoading').remove();
        loading.hide();
    }
}

function DataTable(options, funcComplete) {
    if (!options.aaSorting)
        options.aaSorting = [];

    if (!options.columnDefs)
        options.aaSorting = [];

    if (!options.buttons)
        options.buttons = [];

    if (options.ajax && options.ajax.url) {
        if (!options.ajax.type)
            options.ajax.type = 'GET';
        if (options.ajax.url == 'blank')
            options.ajax.url = null;

        return $('#' + options.id).DataTable({
            language: getTraducaoDataTables(),
            ajax: options.ajax,
            processing: true,
            columns: options.columns,
            columnDefs: options.columnDefs,
            pagingType: 'full_numbers',
            aaSorting: options.aaSorting,
            buttons: options.buttons,
            iDisplayLength: 10,
            lengthMenu: [
                [5, 10, 25, -1],
                ["05", 10, 25, "Todos"]
            ],
            initComplete: function (settings, json) {
                if (funcComplete)
                    funcComplete(settings, json, this);
            },
            createdRow: function (row, data, dataIndex) {
                if (options.createdRow)
                    options.createdRow(row, data, dataIndex, this);
            }
        });
    }
    else {
        return $('#' + options.id).DataTable({
            language: getTraducaoDataTables(),
            columns: options.columns,
            iDisplayLength: 10,
            pagingType: 'full_numbers',
            buttons: options.buttons,
            aaSorting: options.aaSorting,
            lengthMenu: [
                [5, 10, 25, -1],
                ["05", 10, 25, "Todos"]
            ]
        });
    }
}

function getTraducaoDataTables() {
    return {
        sEmptyTable: 'Nenhum registro encontrado',
        sInfo: 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
        sInfoEmpty: 'Mostrando 0 até 0 de 0 registros',
        sInfoFiltered: '(Filtrados de _MAX_ registros)',
        sInfoPostFix: '',
        sInfoThousands: '.',
        sLengthMenu: 'Mostrar: _MENU_ registros',
        sLoadingRecords: 'Carregando...',
        sProcessing: '<label>Carregando... </label><br /><br /><div class="spinner-border" style="width: 40px; height: 40px; " role="status"><span class="sr-only">Loading...</span></div>',
        sZeroRecords: 'Nenhum registro encontrado',
        sSearch: '',
        //sSearch: 'Buscar',
        sSearchPlaceholder: 'Buscar',
        oPaginate: {
            sNext: 'Próximo',
            sPrevious: 'Anterior',
            sFirst: '<i class="mdi mdi-arrow-left" style="font-size: 14px;"></i>',
            sLast: '<i class="mdi mdi-arrow-right" style="font-size: 14px;"></i>'
        },
        oAria: {
            sSortAscending: ': Ordenar colunas de forma ascendente',
            sSortDescending: ': Ordenar colunas de forma descendente'
        }
    };
}

function abrirModal(id, title) {
    id = id.charAt(0) == '#' ? id : '#' + id;
    $(id + 'Title').text(title);
    $(id).modal({
        backdrop: 'static',
        keyboard: false,
    });
    $(id).modal('show');
}

function fecharModal(id) {
    id = id.charAt(0) == '#' ? id : '#' + id;
    $(id).modal('hide');
}

function setValue(id, val, open, trigger) {
    if (!open)
        open = false;

    $(id).val(val);
    if (trigger)
        $(id).trigger(trigger);

    var parent = $(id).parent();
    if (parent.hasClass('focused') && !open)
        parent.removeClass('focused');
    else if (!parent.hasClass('focused') && open)
        parent.addClass('focused');
}

function getTicks() {
    var d = new Date(); // Your date
    var dStart = new Date(1970, 1, 1);
    return ((d.getTime() - dStart.getTime()) * 10000);
}

function ajustarValor(val) {
    return val?.split('.')?.join('')?.split(',')?.join('.')?.split('%')?.join('');
}

function reloadFloatLabels() {
    $('.floating-labels .form-control').off('focus blur', floatLabels)
    $('.floating-labels .form-control').not('.ignore').on('focus blur', floatLabels).trigger('blur');
}

function floatLabels(e) {
    $(this).parents('.form-group').toggleClass('focused', (e.type === 'focus' || this.value.length > 0));
}

function formatarValor(val) {
    if (typeof val !== 'number')
        val = +val;
    return val.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}