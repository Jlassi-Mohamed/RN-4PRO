from rest_framework import serializers

from orders.models import PurchaseOrder
from .models import WithholdingTaxType, WithholdingTaxPayment
from orders.serializers import PurchaseOrderSerializer  # Assuming you have this


class WithholdingTaxTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithholdingTaxType
        fields = '__all__'


class WithholdingTaxPaymentSerializer(serializers.ModelSerializer):
    # Nested representation of related objects
    purchase_order = PurchaseOrderSerializer(read_only=True)
    tax_type = WithholdingTaxTypeSerializer(read_only=True)

    # For write operations
    purchase_order_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(),
        source='purchase_order',
        write_only=True
    )
    tax_type_id = serializers.PrimaryKeyRelatedField(
        queryset=WithholdingTaxType.objects.all(),
        source='tax_type',
        write_only=True
    )

    class Meta:
        model = WithholdingTaxPayment
        fields = '__all__'