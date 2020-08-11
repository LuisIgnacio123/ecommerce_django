from django.shortcuts import render, render_to_response
from django.template import RequestContext
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from home.models import *
from products.models import *
from orders.models import *
from clients.models import *
# Create your views here.

import os
import tbk
import logging
import random

from datetime import datetime
from random import randint

from .constans import TIPO_PAGO_TBK_DIC
from .settings import *
from .transaction_data import *

settings = Setinggs_tbk()
webpay_service = tbk.services.WebpayService(settings.init_tbk())
transaccion = transaction_order()


#metodo que inicia la conexion de la transaccion con webpay
@action(detail=True, methods=['post'])
def normal_init_transaction(request,pk_order):
	template_name = 'transbank/init_normal.html'
	context = {}
	categories = Categories.objects.filter(estado = True)
	context['categories'] = categories
	context['banners'] = Banners.objects.filter(estado = True).order_by('posicion')
	context['featured'] = Products.objects.filter(estado = True)[:6]

	order = Orders.objects.get(id = pk_order)

	transaction = webpay_service.init_transaction(
		amount=int(order.monto_bruto),
	    buy_order=order.id,
	    return_url=settings.get_base_url() + "/return/",
	    final_url=settings.get_base_url() + "/normal_detail/",
	    session_id=request.user.id or randint(100, 1000)
	)
	
	context['transaction'] = transaction
	transaccion.set_mount(order.monto_bruto)
	transaccion.set_id_order(pk_order)
	transaccion.set_token(transaction['token'])
	
	return render(request, template_name, context)


#metodo que redirige segun la respuesta de webpay 
@csrf_exempt
def normal_return_from_webpay(request):
	token = request.POST.get('token_ws')
	transaction = webpay_service.get_transaction_result(token)
	transaction_detail = transaction['detailOutput'][0]
	webpay_service.acknowledge_transaction(token)

	context = {}
	categories = Categories.objects.filter(estado = True)
	context['categories'] = categories
	context['banners'] = Banners.objects.filter(estado = True).order_by('posicion')
	context['featured'] = Products.objects.filter(estado = True)[:6]

	# if transaction_detail['responseCode'] == 0 and token == transaccion.get_token():
	if transaction_detail['responseCode'] == 0:
		transaccion.set_cardNumber(transaction['cardDetail']['cardNumber'])
		transaccion.set_authorizationCode(transaction_detail['authorizationCode'])
		transaccion.set_paymentTypeCode(transaction_detail['paymentTypeCode'])

		order = Orders.objects.get(id = transaction['buyOrder'])
		template_name =  'transbank/success_normal.html'
		context['transaction'] = transaction

		log = Log_transbank.objects.create(orden = order, token = token, 
									authorizationCode = transaction_detail['authorizationCode'],
									cardNumber = transaction['cardDetail']['cardNumber'],
									fecha = datetime.now(), monto = order.monto_bruto)

		if len(transaction_detail) != 0:
			context['transaction_detail'] = transaction_detail

		context['token'] = token
		context['order'] = order
		order.estado = 'Pagada'
		order.save()

		send_email_client(order)

		return render(request, template_name, context)

	else:
		template_name = 'transbank/failure_normal.html'
		context['transaction'] = transaction
		
		order = Orders.objects.get(id = transaction['buyOrder'])
		order.estado = 'Anulada'
		order.save()
		
		if len(transaction_detail) != 0:
			context['transaction_detail'] = transaction_detail
			log = Log_transbank.objects.create(orden = order, token = token, 
									authorizationCode = transaction_detail['authorizationCode'],
									cardNumber = transaction['cardDetail']['cardNumber'],
									fecha = datetime.now(), monto = order.monto_bruto)

		context['token'] = token
		context['order'] = order

		return render(request, template_name, context)
		# return render_to_response(template_name, context, context_instance=RequestContext(request))

#termino de la transaccion
@csrf_exempt
def normal_detail(request):

	template_name = 'transbank/normal_detail.html'
	context = {}
	categories = Categories.objects.filter(estado = True)
	context['categories'] = categories
	context['banners'] = Banners.objects.filter(estado = True).order_by('posicion')
	context['featured'] = Products.objects.filter(estado = True)[:6]
	
	if request.POST.get('token_ws') != None:
		token = request.POST.get('token_ws')
		context['token'] = token
		try:
			id_order = transaccion.get_id_order(token)

		except:
			id_order = request.POST.get('id_order')

		#se actualiza el pedido pagado por webpay
		context['order'] = Orders.objects.get(id = id_order)
		context['order'].estado = "Pagada"
		context['order'].save()

		order = [id_order]

		context['paymentTypeCode'] = TIPO_PAGO_TBK_DIC[transaccion.get_paymentTypeCode()]
		context['cardNumber'] = '************' + transaccion.get_cardNumber()
		context['authorizationCode'] = transaccion.get_authorizationCode()

		return render(request, template_name, context)

	else:
		id_order = request.POST.get('TBK_ORDEN_COMPRA')

		try:
			order = Orders.objects.get(id = int(id_order))
			log = Log_transbank()
			log.orden = order
			log.token = request.POST.get('TBK_TOKEN')
			log.authorizationCode = transaccion.get_authorizationCode()
			log.cardNumber = transaccion.get_cardNumber()
			log.fecha = datetime.now()
			log.monto = order.monto_bruto
			log.save()

		except:
			pass

		template_name = 'transbank/failure_normal.html'
		context = {}
		categories = Categories.objects.filter(estado = True)
		context['categories'] = categories
		context['banners'] = Banners.objects.filter(estado = True).order_by('posicion')
		context['featured'] = Products.objects.filter(estado = True)[:6]
		context['order'] = Orders.objects.get(id = id_order)
		context['order'].estado = 'Anulada'
		context['order'].save()

		return render(request, template_name, context)

# metodo que envia un correo al cliente con el correo ingresado
def send_email_client(order):
	client_name = order.cliente.user.get_full_name()
	title = "Orden de compra Nº " + str(order.id)
	message = "Muchas gracias por su compra. \n Su compra fue recibida satifactoriamente y esta siendo procesada."
	# subtitle = "Orden de compra N° " + str(order.id)
	text = "Detalle de su compra:"

	body = render_to_string(
			'products/email.html', {
			'title'				: title,
			'username' 			: client_name,
			'message'			: message,
			'subtitle'			: subtitle,
			'text'				: text,
			'products'			: Details_orders.objects.filter(orden = order),
			'dispatch'			: order.despacho.nombre,
			'payment'			: order.metodo_pago.nombre,
			'direction'			: order.direccion,
			'region'			: order.ciudad,
			'commune'			: order.comuna,
			'phone'				: order.cliente.telefono,
			'email'				: order.cliente.user.email,
			'total'				: order.monto_bruto,
			'value_dispatch'	: order.monto_despacho
		},
	)
	email = EmailMessage(
			subject = "Orden de Compra Nº" + str(order.id),
			body = body,
			from_email = 'pedidos@bellavista.cl',
			to = [order.cliente.user.email, 'pedidos@bellavista.cl']
		)
	email.content_subtype = 'html'
	email.send()

