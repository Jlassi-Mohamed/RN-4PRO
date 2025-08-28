from django.urls import path
from .views import ClientAPIView, ClientCountAPIView

urlpatterns = [
    path('', ClientAPIView.as_view(), name='client-list'),
    path('<int:pk>/', ClientAPIView.as_view(), name='client-detail'),
    path('count/', ClientCountAPIView.as_view(), name='client-count'),  # new endpoint

]