from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from clients.models import Client
from products.models import Product


class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('CONFIRMED', 'Confirmé'),
        ('PAID', 'Payé'),
        ('DELIVERED', 'Livré'),
        ('CANCELLED', 'Annulé'),
    ]

    ORDER_TYPE_CHOICES = [
        ('GOODS', 'Marchandises/Équipements'),
        ('SERVICES', 'Services'),
        ('WORKS', 'Travaux'),
        ('SUBSCRIPTION', 'Abonnement'),
        ('INSURANCE', 'Assurance'),
        ('LEASING', 'Leasing'),
        ('FEES', 'Honoraires'),
        ('RENT', 'Loyers'),
        ('COMMISSION', 'Commissions'),
    ]

    reference = models.CharField(max_length=50, unique=True)
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='GOODS')
    notes = models.TextField(blank=True, null=True)
    expected_finish_date = models.DateField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)

    # Financial totals
    total_ht = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    total_tva = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    total_ttc = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))

    # Withholding tax fields
    withholding_tax_amount = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    withholding_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    withholding_tax_applied = models.BooleanField(default=False)
    withholding_tax_excluded = models.BooleanField(default=False)
    withholding_exclusion_reason = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bon de commande'
        verbose_name_plural = 'Bons de commande'

    def __str__(self):
        return f"{self.reference} - {self.client.name}"

    def calculate_totals(self):
        """Calculate all financial totals from order items"""
        if self.pk:  # Only calculate if order exists in DB
            items = self.items.all()
            self.total_ht = sum(item.total_ht for item in items) if items else Decimal('0.000')
            self.total_tva = sum(item.tva_amount for item in items) if items else Decimal('0.000')
            self.total_ttc = sum(item.total_ttc for item in items) if items else Decimal('0.000')
        else:
            # For new orders, set defaults
            self.total_ht = Decimal('0.000')
            self.total_tva = Decimal('0.000')
            self.total_ttc = Decimal('0.000')

    def save(self, *args, **kwargs):
        # Calculate totals before saving
        self.calculate_totals()
        self.determine_withholding_tax()
        super().save(*args, **kwargs)

    def is_subject_to_withholding_tax(self):
        """Determine if this order is subject to withholding tax based on tax regulations"""
        # Explicit exclusions from the tax document
        if self.order_type in ['SUBSCRIPTION', 'INSURANCE', 'LEASING']:
            self.withholding_tax_excluded = True
            self.withholding_exclusion_reason = f"Exclusion pour {self.get_order_type_display()}"
            return False

        # Non-resident clients are exempt
        if not self.client.is_resident:
            self.withholding_tax_excluded = True
            self.withholding_exclusion_reason = "Client non-résident"
            return False

        # Tax-exempt clients
        if self.client.tax_regime == 'EXEMPT':
            self.withholding_tax_excluded = True
            self.withholding_exclusion_reason = "Client exonéré d'impôt"
            return False

        # Amount must be >= 1000D TTC
        if self.total_ttc < Decimal('1000.000'):
            self.withholding_tax_excluded = True
            self.withholding_exclusion_reason = "Montant inférieur à 1000D TTC"
            return False

        # For public entities: always subject if amount >= 1000D (unless excluded above)
        if self.client.is_public_client():
            return True

        # For private entities: only if it's a proper "marché" (we consider all orders as markets)
        if self.client.client_type in ['COMPANY', 'INDIVIDUAL']:
            return True

        return False

    def get_applicable_withholding_rate(self):
        """Determine the applicable withholding tax rate based on order type"""
        # Special rates take precedence over the default 1.5%
        if self.order_type == 'FEES':
            if self.client.tax_regime == 'REAL':
                return Decimal('2.5')  # Honoraires régime réel
            else:
                return Decimal('10.0')  # Honoraires régime forfaitaire

        if self.order_type == 'RENT':
            return Decimal('10.0')  # Loyers

        if self.order_type == 'COMMISSION':
            return Decimal('5.0')  # Commissions

        # Default rate for goods/services/travaux
        return Decimal('1.5')

    def determine_withholding_tax(self):
        """Calculate and set the withholding tax amount"""
        self.withholding_tax_excluded = False
        self.withholding_exclusion_reason = ""

        if not self.is_subject_to_withholding_tax():
            self.withholding_tax_amount = Decimal('0.000')
            self.withholding_tax_rate = Decimal('0.00')
            self.withholding_tax_applied = False
            return

        rate = self.get_applicable_withholding_rate()
        withholding_amount = self.total_ttc * (rate / Decimal('100.0'))

        self.withholding_tax_amount = withholding_amount
        self.withholding_tax_rate = rate
        self.withholding_tax_applied = True

    def get_net_amount_to_pay(self):
        """Calculate the net amount to pay after withholding tax"""
        return self.total_ttc - self.withholding_tax_amount

    def mark_as_paid(self, payment_date):
        """Mark order as paid and set payment date"""
        self.status = 'PAID'
        self.payment_date = payment_date
        self.save()


class PurchaseOrderProduct(models.Model):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))]
    )
    remise = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000')
    )
    tva_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Add these computed fields to store the calculated values
    total_ht = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    tva_amount = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    total_ttc = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))

    class Meta:
        verbose_name = 'Article de commande'
        verbose_name_plural = 'Articles de commande'

    def __str__(self):
        return f"{self.product.name} x {self.quantity} ({self.order})"

    def calculate_totals(self):
        """Calculate all item totals"""
        # Store current product prices at time of order if not set
        if not self.unit_price:
            self.unit_price = self.product.prix_unit
        if not self.tva_rate:
            self.tva_rate = self.product.tva_rate

        # Calculate totals
        total_ht_before_discount = self.quantity * self.unit_price
        discount_amount = total_ht_before_discount * (self.remise / Decimal("100"))
        self.total_ht = total_ht_before_discount - discount_amount
        self.tva_amount = self.total_ht * (self.tva_rate / Decimal("100"))
        self.total_ttc = self.total_ht + self.tva_amount

    def save(self, *args, **kwargs):
        # Calculate item totals before saving
        self.calculate_totals()
        super().save(*args, **kwargs)

        # Update order totals after saving item
        if self.order:
            self.order.calculate_totals()
            self.order.determine_withholding_tax()
            self.order.save()

