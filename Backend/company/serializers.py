from rest_framework import serializers
from .models import CompanyInfo, CompanyDocument


class CompanyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDocument
        fields = '__all__'
        read_only_fields = ('upload_date',)


class CompanyInfoSerializer(serializers.ModelSerializer):
    documents = CompanyDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = CompanyInfo
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')