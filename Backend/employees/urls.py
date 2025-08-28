from django.urls import path
from .views import EmployeeAPIView

urlpatterns = [
    path('', EmployeeAPIView.as_view(), name='employee-list'),
    path('<int:pk>/', EmployeeAPIView.as_view(), name='employee-detail'),
]