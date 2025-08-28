from django.db import migrations


def insert_default_tax_types(apps, schema_editor):
    WithholdingTaxType = apps.get_model('taxes', 'WithholdingTaxType')

    # 1.5% withholding tax for public acquisitions
    WithholdingTaxType.objects.create(
        name="Retenue a la source 1,5% (IR/IS) - Acquisitions publiques",
        code="RS15_PUBLIC",
        rate=1.5,
        is_liberatory=False,
        is_definitive=False,
        applies_to_client_types="Etat,Collectivites locales,Entreprises publiques,Etablissements publics",
        minimum_amount=1000.000,
        description="Applicable aux montants >= 1000D TTC pour les acquisitions de l'Etat, collectivites locales et entreprises publiques"
    )

    # 1.5% withholding tax for private entities (markets)
    WithholdingTaxType.objects.create(
        name="Retenue a la source 1,5% (IR/IS) - Marches prives",
        code="RS15_PRIVATE",
        rate=1.5,
        is_liberatory=False,
        is_definitive=False,
        applies_to_client_types="Personnes morales privees,Personnes physiques regime reel",
        minimum_amount=1000.000,
        description="Applicable aux marches conclus par personnes morales privees et personnes physiques au regime reel"
    )

    # 2.5% withholding tax for fees (honoraires)
    WithholdingTaxType.objects.create(
        name="Retenue a la source 2,5% - Honoraires (regime reel)",
        code="RS25_HONORAIRES",
        rate=2.5,
        is_liberatory=False,
        is_definitive=False,
        applies_to_client_types="Tous",
        minimum_amount=0.000,
        description="Applicable aux honoraires pour prestataires soumis au regime reel d'IR"
    )

    # 10% withholding tax for fees (regime forfaitaire)
    WithholdingTaxType.objects.create(
        name="Retenue a la source 10% - Honoraires (regime forfaitaire)",
        code="RS10_HONORAIRES",
        rate=10.0,
        is_liberatory=False,
        is_definitive=False,
        applies_to_client_types="Tous",
        minimum_amount=0.000,
        description="Applicable aux honoraires pour prestataires soumis au regime forfaitaire d'IR"
    )

    # 10% withholding tax for rents (loyers)
    WithholdingTaxType.objects.create(
        name="Retenue a la source 10% - Loyers",
        code="RS10_LOYERS",
        rate=10.0,
        is_liberatory=False,
        is_definitive=False,
        applies_to_client_types="Tous",
        minimum_amount=0.000,
        description="Applicable aux loyers et revenus fonciers"
    )

    # 5% withholding tax for commissions
    WithholdingTaxType.objects.create(
        name="Retenue a la source 5% - Commissions",
        code="RS05_COMMISSIONS",
        rate=5.0,
        is_liberatory=False,
        is_definitive=False,
        applies_to_client_types="Tous",
        minimum_amount=0.000,
        description="Applicable aux commissions et courtages"
    )


def reverse_insertion(apps, schema_editor):
    WithholdingTaxType = apps.get_model('taxes', 'WithholdingTaxType')
    WithholdingTaxType.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ('taxes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(insert_default_tax_types, reverse_insertion),
    ]