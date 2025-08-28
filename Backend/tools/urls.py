from django.urls import path
from .views import ToolAPIView

urlpatterns = [
    # List and create tools
    path('', ToolAPIView.as_view()),
    # Retrieve, update, delete a single tool by pk
    path('<int:pk>/', ToolAPIView.as_view()),
]
