from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Document, Article
from .serializers import DocumentSerializer, ArticleSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-date')
    serializer_class = DocumentSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter by type (BON or FACTURE) using query param.
        Example: /api/documents/?type=BON
        """
        queryset = super().get_queryset()
        doc_type = self.request.query_params.get('type')
        if doc_type in ['BON', 'FACTURE']:
            queryset = queryset.filter(type=doc_type)
        return queryset


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter articles by document ID using query param.
        Example: /api/articles/?document_id=1
        """
        queryset = super().get_queryset()
        document_id = self.request.query_params.get('document_id')
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        return queryset
