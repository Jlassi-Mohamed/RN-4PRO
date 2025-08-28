from django.urls import path
from .views import ProductAPIView, ProductCategoryAPIView

urlpatterns = [
    path('categories/', ProductCategoryAPIView.as_view(), name='product-category-list'),
    path('categories/<int:pk>/', ProductCategoryAPIView.as_view(), name='product-category-detail'),

    path('', ProductAPIView.as_view(), name='product-list'),
    path('<int:pk>/', ProductAPIView.as_view(), name='product-detail'),
]