from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, ArticleViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'articles', ArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),
]
