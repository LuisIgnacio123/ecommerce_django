//cart options
/**
 * Carro de compra simple
 * @param {any} sessionName nombre del carro para almacenar
 * @param {any} items lista de elementos, necesita id, product, price, qty como minimo. Pero puedes almacenar todo lo que quieras
 */
 
function Cart(sessionName, items) {
    if (sessionName !== undefined && sessionName !== null) { 
        this.sessionName = sessionName; 
    }
    else {
        this.sessionName = 'carro'; 
    }

    if (items !== undefined && items !== null) { 
        this.items = items; 
    }
    else {
        if (sessionName !== undefined && sessionName !== null) {
            try {
                this.items = JSON.parse(localStorage[sessionName]);
            } 
            catch (e) {
                this.items = [];
            }
        }
        else { 
            this.items = []; 
        }
    }

    /**
     * Agregar un item al carro
     * @param {any} item Objeto con los datos del item. Minimo estas propiedades id, product, price, qty
     * @param {any} itemImg objeto contenedor o identificador ej. #miproducto de la imagen para hacer volar la imagen hacia el carro
     * @param {any} cart objeto contenedor del carro o identificador ej. #micarro
     */
    Cart.prototype.add = function (item, itemImg, cart) {
        var add = true;
        for (var i = 0; i < this.items.length; i++) {
            if ((item.id == this.items[i].id)) {
                this.items[i].qty = parseFloat(item.qty);
                this.items[i].price = parseFloat(item.price);
                add = false;
            }
        }
        if (add === true) 
            this.items.push(item);

        localStorage.setItem(this.sessionName, JSON.stringify(this.items));

        //si envia la imagen y el carro vuela la imagen hacia el carro
        if (itemImg !== undefined && itemImg !== null && cart !== undefined && cart !== null)
            flyToElement(itemImg, cart);

        return this.items;
    };

    /**
     * Recoge los datos del id consultado
     * @param {any} id identificador del item a eliminar
     */
    Cart.prototype.getItemById = function (id) {
        var miItem;
        for (var i = 0; i < this.items.length; i++) {
            id == this.items[i].id ? miItem = this.items[i] : false;
        }
        return miItem;
    };

    /**
     * Recoge los datos del item consultado
     * @param {any} product nombre dle producto a consulta
     */
    Cart.prototype.getItemByProduct = function (product) {
        var miItem;
        for (var i = 0; i < this.items.length; i++) {
            product == this.items[i].product ? miItem = this.items[i] : false;
        }
        return miItem;
    };

    /**
     * Elimina el item seleccionado del carro
     * @param {any} id identificador del item a eliminar
     */
    Cart.prototype.remove = function (id) {
        for (var i = 0; i < this.items.length; i++) {
            id == this.items[i].id ? this.items.splice(i, 1) : false;
        }
        localStorage.setItem(this.sessionName, JSON.stringify(this.items));

        if (this.items.length != 0){
            location.reload();
            // return this.items;
        }
        else{
            localStorage.removeItem(this.sessionName);
            location.reload();
            // return true;
        }
    };

    /** Elimina el carro */
    Cart.prototype.clear = function () {
        this.items = [];
        localStorage.removeItem(this.sessionName);
        return true;
    };

    /** Actualiza el carro */
    Cart.prototype.update = function(id){
        var qty = parseFloat(jQuery('#qty_' + id).val());
        for (var i = 0; i < this.items.length; i++) {
            if ((id == this.items[i].id)) {
                this.items[i].qty = parseFloat(qty);
            }
        }

        localStorage.setItem(this.sessionName, JSON.stringify(this.items));
        location.reload();
    }


    /** Devulve el contenido del carro */
    Cart.prototype.get = function () {
        return this.items;
    };

    /**
     * Enviar el objeto con los datos para el carro
     * @param {any} items Ojeto con al menos estas propiedades id, product, price, qty
     */
    Cart.prototype.set = function (items) {
        this.items = items;
        localStorage.setItem(this.sessionName, JSON.stringify(this.items));
    };

    /** Devuelve el total de lineas del carro */
    Cart.prototype.count = function() {
        var total = 0;
        $.each(this.items, function (key, value) {
            total += value.qty;
        });

        return total;
    }

    /** Devuelve el total del carro */
    Cart.prototype.getTotal = function () {
        var total = 0;
        $.each(this.items, function (key, value) {
            total += (value.price * value.qty);
        });
        return total;
    };

    /**
     * Imprimir en la ventana del carro
     * @param {any} div objeto contenedor del carro o identificador ej. #micarro
     */
    Cart.prototype.printHTMLEdit = function (div) {
        $(div).empty();
        var carrito = '';
        var count = 0;

        $.each(this.items, function (key, value) {
            carrito += '<a href="#">' +
                '<img src="' + value.image +'" width="45" height="45" alt="" />' +
                '<h6>' +
                    '<span>' + value.qty +'</span> ' + value.product + 
                '</h6>' + 
                '<small>$ ' + addCommas(value.price * value.qty)  +' </small>';

            count += value.qty;
        });

        $(div).append(carrito);
        var total = this.getTotal();

        $('#total').empty();
        $('#total').append('<strong>TOTAL:</strong>$ ' + addCommas(total));
        
        jQuery('#cart_count').empty();
        jQuery('#cart_count').append(count);

    };
    /**
     * Imprimir en la pagina que se visualiza todos los
     * productos del carrito
    */
    Cart.prototype.printsell = function(){

        if(this.items.length != 0){
            jQuery('#empty_cart').hide();
            jQuery('#body_cart').empty();

            $.each(this.items, function (key, value) {
                var carrito = '';
                if(value.size_name){
                    carrito = '<div class="item">' +
                                    '<div class="cart_img float-left fw-100 p-10 text-left">' +
                                        '<img src="' + value.image +'" width="80" alt="" />' +
                                    '</div>' +
                                    '<a href="" class="product_name">'+
                                        '<span>' + value.product +'</span>' +
                                        '<small> Talla: ' + value.size_name + '</small>' +
                                    '</a>' +
                                    '<button class="remove_item" onclick="remove_product(' +value.id +')">'+
                                        '<i class="fa fa-times"></i>' +
                                    '</button>'+
                                    // '<button class="btn remove_item" id="btn_remove" data-id="' + value.id +'">' +
                                    //     '<i class="fa fa-times"></i>' +
                                    '</button>' + 
                                    '<div class="total_price">' + 
                                        '$' + addCommas(value.price * value.qty) + '</span>'+
                                    '</div>' + 
                                    '<div class="qty">' +
                                        '<input onchange="update_cart('+ value.id + ')"' +
                                        ' oninput="if(this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"'+
                                        ' type="number" value="' + value.qty +'" id="qty_'+ value.id + '" name="qty" maxlength="4" '+
                                        ' max="' + value.stock +'" min "1" /> &times; $' + addCommas(value.price) +
                                    '</div>' +
                                '</div>' +
                                '<div class="clearfix"></div>';
                }
                else{
                    carrito = '<div class="item">' +
                                    '<div class="cart_img float-left fw-100 p-10 text-left">' +
                                        '<img src="' + value.image +'" width="80" alt="" />' +
                                    '</div>' +
                                    '<a href="" class="product_name">'+
                                        '<span>' + value.product +'</span>' +
                                    '</a>' +
                                    '<button class="remove_item" onclick="remove_product(' +value.id +')">'+
                                        '<i class="fa fa-times"></i>' +
                                    '</button>'+
                                    // '<button class="btn remove_item" id="btn_remove" data-id="' + value.id +'">' +
                                    //     '<i class="fa fa-times"></i>' +
                                    '</button>' + 
                                    '<div class="total_price">' + 
                                        '$' + addCommas(value.price * value.qty) + '</span>'+
                                    '</div>' + 
                                    '<div class="qty">' +
                                        '<input onchange="update_cart('+ value.id + ')"' +
                                        ' oninput="if(this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"'+
                                        ' type="number" value="' + value.qty +'" id="qty_'+ value.id + '" name="qty" maxlength="4" '+
                                        ' max="' + value.stock +'" min "1" /> &times; $' + addCommas(value.price) +
                                    '</div>' +
                                '</div>' +
                                '<div class="clearfix"></div>';
                }
                jQuery('#body_cart').append(carrito);
            });

            // var div = '<div class="clearfix"></div>';

            // jQuery('#body_cart').append(div);
            jQuery('#sub-total').empty();
            jQuery('#total-order').empty();
            jQuery('#sub-total').append('$ ' + addCommas(this.getTotal()));
            jQuery('#total-order').append('$ ' + addCommas(this.getTotal()));

        }
        else{
            jQuery('#show_cart').hide();
        }

    };

    Cart.prototype.printTotal = function(){
        jQuery('#sub_total_buy').empty();
        jQuery('#total_buy').empty();

        jQuery('#sub_total_buy').append('$ ' + addCommas(this.getTotal()));
        jQuery('#sub_total_buy').attr('data-val', this.getTotal());
        jQuery('#total_buy').append('$ ' + addCommas(this.getTotal()));
    }

    Cart.prototype.saveOrder = function(token, cart){
        var products = [];

        $.each(this.items, function (key, value) {
            if (value.size_id){
                var items = {
                    'id'        : value.id,
                    'qty'       : value.qty,
                    'price'     : value.price,
                    'color'     : value.color,
                    'size_id'   : value.size_id,
                }
                products.push(items);
            }
            else{
                var items = {
                    'id'        : value.id,
                    'qty'       : value.qty,
                    'price'     : value.price,
                    'color'     : value.color,
                }
                products.push(items);   
            }
        });

        var id_payment = jQuery('input:radio[name=payment]:checked').val();
        var id_dispatch = jQuery('input:radio[name=dispatch]:checked').val();
        var value_dispatch = jQuery('#dispatch-value').attr('data-dispatch');
        var name = jQuery('#billing_firstname').val();
        var last_name = jQuery('#billing_lastname').val();
        var email = jQuery('#billing_email').val();
        var id_address_delivery = jQuery('input:radio[name=id_address_delivery]:checked').val();
        var create_acount = jQuery('input:checkbox[name=create-account]:checked').val();
        var password = jQuery('#password').val();

        if (id_payment == undefined){
            jQuery('#btn_save').prop('disabled', false);
            jQuery('#btn_save').find('.spinner-grow').remove()

            alert('Debe seleccionar un método de pago');


            return false;
        }

        else if (id_dispatch == undefined){
            jQuery('#btn_save').prop('disabled', false);
            jQuery('#btn_save').find('.spinner-grow').remove()

            alert('Debe seleccionar un método de envio');

            return false;
        }

        else if (name == '' && last_name == '' && email == ''){
            jQuery('#btn_save').prop('disabled', false);
            jQuery('#btn_save').find('.spinner-grow').remove()

            alert('Faltan campos por rellenar');

            return false;
        }

        else if (id_address_delivery == undefined){
            var address = jQuery('#billing_address1').val();
            var region = jQuery('#billing_city').val();
            var state = jQuery('#billing_state').val();
            var zipcode = jQuery('#billing_zipcode').val();
            var phone = jQuery('#billing_phone').val();

            if (address == '' || region == '' || state == '' || zipcode == ''|| phone == ''){
                jQuery('#btn_save').prop('disabled', false);
                jQuery('#btn_save').find('.spinner-grow').remove()

                alert('Faltan campos por rellenar');

                return false;
            }

            else{
                var direction = {
                    'address'    : address,
                    'region'     : region,
                    'state'      : state,
                    'zipcode'    : zipcode,
                }
            }
        }

        else if (id_address_delivery != undefined){
            var id_direction = id_address_delivery; 
        }

        var param = {
            'create_acount' : create_acount,
            'password'      : password,
            'products'      : products,
            'id_payment'    : id_payment,
            'id_dispatch'   : id_dispatch,
            'name'          : name,
            'last_name'     : last_name,
            'email'         : email,
            'direction'     : direction,
            'id_direction'  : id_direction,
            'phone'         : phone,
            'value_dispatch': value_dispatch,
        }

        $.ajaxSetup({
            headers: { "X-CSRFToken": token }
        });

        $.ajax({
            type : 'post',
            data : JSON.stringify(param),
            url : '/save_order/',
            dataType : 'json',
            success: function(response){
                if (response.response == 'success'){
                    window.location.href = response.url;
                    cart.clear()
                }
                else{
                    window.location.href = response.url;
                    cart.clear()
                }
            }
        })

        .fail(function( jqXHR, textStatus, errorThrown ) {
            jQuery('#btn_save').prop('disabled', false);
            jQuery('#btn_save').find('.spinner-grow').remove()
            
            alert( "La solicitud a fallado: " +  textStatus);

            return false;
        });

    }

    /**
     * Hacer volar la imagen del articulo seleccionado hasta el carro de compra
     * @param {any} flyer objeto original o identificador ej. #miproducto
     * @param {any} flyingTo objeto hacia donde volar o identificador ej. #micarro
     */
    function flyToElement(flyer, flyingTo) {
        var $func = $(this);
        var divider = 3;
        var flyerClone = $(flyer).clone();
        $(flyerClone).css({ position: 'absolute', top: $(flyer).offset().top + "px", left: $(flyer).offset().left + "px", opacity: 1, 'z-index': 1000 });
        $('body').append($(flyerClone));
        var gotoX = $(flyingTo).offset().left + ($(flyingTo).width() / 2) - ($(flyer).width() / divider) / 2;
        var gotoY = $(flyingTo).offset().top + ($(flyingTo).height() / 2) - ($(flyer).height() / divider) / 2;

        $(flyerClone).animate({
            opacity: 0.4,
            left: gotoX,
            top: gotoY,
            width: $(flyer).width() / divider,
            height: $(flyer).height() / divider
        }, 700,
            function () {
                $(flyingTo).fadeOut('fast', function () {
                    $(flyingTo).fadeIn('fast', function () {
                        $(flyerClone).fadeOut('fast', function () {
                            $(flyerClone).remove();
                        });
                    });
                });
            });
    }

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + '.' + '$2');
        }
        return x1 + x2;
    }
}