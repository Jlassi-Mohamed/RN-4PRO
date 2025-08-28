from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderProduct
from products.models import Product


class PurchaseOrderProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PurchaseOrderProduct
        fields = [
            "id",
            "order",
            "product",
            "product_name",
            "quantity",
            "remise",
            "unit_price",
            "total_ht",
            "tva_amount",
            "total_ttc",
        ]
        read_only_fields = ["id", "total_ht", "tva_amount", "total_ttc"]
        extra_kwargs = {
            "order": {"write_only": True, "required": False},
            "unit_price": {"required": False, "allow_null": True},
        }

class PurchaseOrderSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    items = PurchaseOrderProductSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "reference",
            "client",
            "client_name",
            "status",
            "order_type",
            "notes",
            "expected_finish_date",
            "payment_date",
            # financial totals
            "total_ht",
            "total_tva",
            "total_ttc",
            # withholding tax
            "withholding_tax_amount",
            "withholding_tax_rate",
            "withholding_tax_applied",
            "withholding_tax_excluded",
            "withholding_exclusion_reason",
            # related items
            "items",
            "created_at",
            "updated_at",
        ]