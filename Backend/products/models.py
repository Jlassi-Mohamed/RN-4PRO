from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        "ProductCategory",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    code = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=200)

    # Adjust decimal places to match frontend expectations
    prix_unit = models.DecimalField(max_digits=10, decimal_places=2)  # Changed from 3 to 2
    tva_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("19.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    def __str__(self):
        return f"{self.name} ({self.category})" if self.category else self.name