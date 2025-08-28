from django.urls import path
from .views import WithholdingTaxTypeAPIView, WithholdingTaxPaymentAPIView

urlpatterns = [
    # Tax Types endpoints
    path('types/', WithholdingTaxTypeAPIView.as_view(), name='tax-type-list'),
    path('types/<int:pk>/', WithholdingTaxTypeAPIView.as_view(), name='tax-type-detail'),

    # Tax Payments endpoints
    path('payments/', WithholdingTaxPaymentAPIView.as_view(), name='tax-payment-list'),
    path('payments/<int:pk>/', WithholdingTaxPaymentAPIView.as_view(), name='tax-payment-detail'),
]