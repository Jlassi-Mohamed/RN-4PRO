from rest_framework import serializers
from .models import Document, Article
from fournisseurs.models import Fournisseur


class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = ['id', 'nom']


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    articles = ArticleSerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    fournisseur = FournisseurSerializer(read_only=True)
    fournisseur_id = serializers.PrimaryKeyRelatedField(
        queryset=Fournisseur.objects.all(),
        source="fournisseur",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Document
        fields = [
            'id',
            'ref',
            'date',
            'description',
            'fournisseur',       # nested object for GET
            'fournisseur_id',    # id field for POST/PUT
            'type',
            'type_display',
            'articles'
        ]
