
from django.urls import path
from transbank import views
app_name = "transbank"

urlpatterns = [
	path('normal_init_transaction/<int:pk_order>',views.normal_init_transaction, name='normal_init_transaction'),
	path('return/',views.normal_return_from_webpay, name='normal_return_from_webpay'),
	path('normal_detail/', views.normal_detail, name='normal_detail'),
]