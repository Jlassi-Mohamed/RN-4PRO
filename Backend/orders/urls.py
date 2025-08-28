from django.urls import path

from .views import PurchaseOrderAPIView, PurchaseOrderProductAPIView, DraftOrderCountAPIView, MonthlySalesAPIView, \
    OrdersStatusCountAPIView, TotalProfitAPIView

urlpatterns = [
    # Purchase Orders
    path('', PurchaseOrderAPIView.as_view(), name='order-list'),
    path('<int:pk>/', PurchaseOrderAPIView.as_view(), name='order-detail'),

    # Order Items (Products inside an order)
    path('<int:order_pk>/items/', PurchaseOrderProductAPIView.as_view(), name='order-item-list'),
    path('<int:order_pk>/items/<int:pk>/', PurchaseOrderProductAPIView.as_view(), name='order-item-detail'),
    path('count/draft/', DraftOrderCountAPIView.as_view(), name='draft-order-count'),  # new endpoint
    path('sales/monthly/', MonthlySalesAPIView.as_view(), name='monthly-sales'),
    path('status-count/', OrdersStatusCountAPIView.as_view(), name='orders-status-count'),
    path('total-profit/', TotalProfitAPIView.as_view(), name='total-profit')

]
