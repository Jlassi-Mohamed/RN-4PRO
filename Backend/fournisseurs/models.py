from django.db import models

class Fournisseur(models.Model):
    nom = models.CharField(max_length=255)
    matricule_fiscal = models.CharField(max_length=50, unique=True)
    adresse = models.TextField(blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} - {self.matricule_fiscal}"

