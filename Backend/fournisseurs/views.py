from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import Fournisseur
from .serializers import FournisseurSerializer

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer

    @action(detail=False, methods=['get'])
    def count(self, request):
        total = Fournisseur.objects.count()
        return Response({"total_fournisseurs": total})

