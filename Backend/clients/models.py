from django.db import models


class Client(models.Model):
    CLIENT_TYPE_CHOICES = [
        ('INDIVIDUAL', 'Particulier'),
        ('COMPANY', 'Entreprise'),
        ('GOVERNMENT', 'Etat/Collectivité locale'),
        ('PUBLIC_ENTITY', 'Entreprise/Organisme public'),
        ('NON_RESIDENT', 'Non-résident'),
    ]

    TAX_REGIME_CHOICES = [
        ('REAL', 'Régime réel'),
        ('SIMPLIFIED', 'Régime simplifié'),
        ('EXEMPT', 'Exonéré'),
    ]

    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    tax_identification = models.CharField(max_length=50, blank=True)
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES)
    tax_regime = models.CharField(max_length=20, choices=TAX_REGIME_CHOICES, blank=True)
    is_resident = models.BooleanField(default=True)
    is_vat_registered = models.BooleanField(default=False) #

    def __str__(self):
        return f"{self.name} ({self.get_client_type_display()})"
    def is_public_client(self):
        """Check if client is a public entity (government or public entity)"""
        return self.client_type in ['GOVERNMENT', 'PUBLIC_ENTITY']