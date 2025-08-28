from django.db import models
from fournisseurs.models import Fournisseur

class Document(models.Model):
    TYPE_CHOICES = [
        ('BON', 'Bon de livraison'),
        ('FACTURE', 'Facture'),
    ]

    ref = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    fournisseur = models.ForeignKey(
        Fournisseur, on_delete=models.SET_NULL, null=True, related_name='documents'
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='BON')

    def __str__(self):
        return f"{self.get_type_display()} {self.ref} - {self.fournisseur.nom if self.fournisseur else 'Sans fournisseur'}"


class Article(models.Model):
    document = models.ForeignKey(
        "Document",
        on_delete=models.CASCADE,
        related_name="articles",
        null=True,
        blank=True,
    )
    code = models.CharField(max_length=50, null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)

