from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.CompanyInfoViewSet, basename='company')
router.register(r'(?P<company_pk>\d+)/documents', views.CompanyDocumentViewSet, basename='company-documents')

urlpatterns = [
    path('', include(router.urls)),
]