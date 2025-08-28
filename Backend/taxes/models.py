from django.db import models

from orders.models import PurchaseOrder


class WithholdingTaxType(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    rate = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
    is_liberatory = models.BooleanField(default=False)
    is_definitive = models.BooleanField(default=False)
    applies_to_client_types = models.CharField(max_length=200)  # Comma-separated values
    minimum_amount = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    description = models.CharField(max_length=1000,null=True, blank=True)
    def __str__(self):
        return f"{self.name} ({self.rate}%)"


class WithholdingTaxPayment(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE)
    tax_type = models.ForeignKey(WithholdingTaxType, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=3)
    payment_date = models.DateField()
    is_paid_to_treasury = models.BooleanField(default=False)
    treasury_payment_ref = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Retenue {self.tax_type} - {self.amount} DT"
