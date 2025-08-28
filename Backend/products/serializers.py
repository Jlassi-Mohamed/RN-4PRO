from rest_framework import serializers
from .models import Product, ProductCategory

# ---------------- CATEGORIES ----------------
class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'description']

# ---------------- PRODUCTS ----------------
class ProductSerializer(serializers.ModelSerializer):
    # Accept category_id from frontend for writes
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductCategory.objects.all(),
        source='category',  # maps category_id -> category FK
        write_only=True,
        required=False,
        allow_null=True,
    )

    # Return nested category details for GET
    category = ProductCategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'code', 'name', 'prix_unit', 'tva_rate', 'category', 'category_id']
