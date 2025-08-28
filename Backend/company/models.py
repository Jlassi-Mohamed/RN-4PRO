from django.db import models
from django.core.validators import RegexValidator


class CompanyInfo(models.Model):
    COMPANY_TYPE_CHOICES = [
        ('SARL', 'SARL (Société à Responsabilité Limitée)'),
        ('SA', 'SA (Société Anonyme)'),
        ('SNC', 'SNC (Société en Nom Collectif)'),
        ('SCS', 'SCS (Société en Commandite Simple)'),
        ('SCA', 'SCA (Société en Commandite par Actions)'),
        ('SUARL', 'SUARL (Société Unipersonnelle à Responsabilité Limitée)'),
        ('EURL', 'EURL (Entreprise Unipersonnelle à Responsabilité Limitée)'),
        ('OTHER', 'Autre'),
    ]

    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    legal_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Dénomination sociale")
    company_type = models.CharField(max_length=20, choices=COMPANY_TYPE_CHOICES, verbose_name="Type de société")

    # Tax and identification information
    tax_identification = models.CharField(max_length=50, unique=True, verbose_name="Matricule Fiscal")
    trade_register = models.CharField(max_length=50, blank=True, null=True, verbose_name="Registre de Commerce")

    # Contact information
    address = models.TextField(verbose_name="Adresse", null=True, blank=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Le numéro de téléphone doit être au format: '+999999999'. Jusqu'à 15 chiffres autorisés."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, verbose_name="Téléphone")
    email = models.EmailField(verbose_name="Email")
    website = models.URLField(blank=True, null=True, verbose_name="Site web")

    # Additional information
    founding_date = models.DateField(blank=True, null=True, verbose_name="Date de création")
    capital = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True, verbose_name="Capital social")

    # Bank information
    bank_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Nom de la banque")
    bank_account = models.CharField(max_length=50, blank=True, null=True, verbose_name="Numéro de compte")
    bank_rib = models.CharField(max_length=100, blank=True, null=True, verbose_name="RIB")

    # Logo and branding
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Information de l'entreprise"
        verbose_name_plural = "Informations de l'entreprise"

    def __str__(self):
        return self.name


class CompanyDocument(models.Model):
    DOCUMENT_TYPES = [
        ('STATUTES', 'Statuts de la société'),
        ('TAX_CERTIFICATE', 'Attestation fiscale'),
        ('TRADE_REGISTER', 'Extrait registre de commerce'),
        ('IDENTITY', 'Pièce d identité du gérant'),
        ('OTHER', 'Autre document'),
    ]

    company = models.ForeignKey(CompanyInfo, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, verbose_name="Type de document")
    title = models.CharField(max_length=255, verbose_name="Titre du document")
    file = models.FileField(upload_to='company/documents/%Y/%m/%d/', verbose_name="Fichier")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    upload_date = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateField(blank=True, null=True, verbose_name="Valide jusqu'au")

    class Meta:
        verbose_name = "Document de l'entreprise"
        verbose_name_plural = "Documents de l'entreprise"

    def __str__(self):
        return f"{self.title} - {self.company.name}"