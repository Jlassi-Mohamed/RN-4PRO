from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CompanyInfo, CompanyDocument
from .serializers import CompanyInfoSerializer, CompanyDocumentSerializer


class CompanyInfoViewSet(viewsets.ModelViewSet):
    queryset = CompanyInfo.objects.all()
    serializer_class = CompanyInfoSerializer

    def get_queryset(self):
        # In a real application, you might want to filter by current user/company
        return CompanyInfo.objects.all()

    def create(self, request, *args, **kwargs):
        # Only allow one company info instance
        if CompanyInfo.objects.exists():
            return Response(
                {"error": "Les informations de l'entreprise existent déjà. Utilisez la mise à jour."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upload_logo(self, request, pk=None):
        company = self.get_object()
        if 'logo' not in request.FILES:
            return Response(
                {"error": "Aucun fichier logo fourni"},
                status=status.HTTP_400_BAD_REQUEST
            )

        company.logo = request.FILES['logo']
        company.save()
        return Response(
            {"message": "Logo mis à jour avec succès"},
            status=status.HTTP_200_OK
        )


class CompanyDocumentViewSet(viewsets.ModelViewSet):
    queryset = CompanyDocument.objects.all()
    serializer_class = CompanyDocumentSerializer

    def get_queryset(self):
        company_id = self.kwargs.get('company_pk')
        if company_id:
            return CompanyDocument.objects.filter(company_id=company_id)
        return CompanyDocument.objects.all()

    def perform_create(self, serializer):
        company_id = self.kwargs.get('company_pk')
        company = get_object_or_404(CompanyInfo, id=company_id)
        serializer.save(company=company)