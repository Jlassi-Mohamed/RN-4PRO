from django.db import models

class Tool(models.Model):
    CONDITION_CHOICES = [
        ('good', 'Good'),
        ('repair', 'Needs Repair'),
        ('broken', 'Broken'),
    ]

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255, blank=True, null=True)  # e.g., drill, saw
    description = models.TextField(blank=True, null=True)
    supplier = models.CharField(max_length=255, blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    location = models.CharField(max_length=255, blank=True, null=True)
    last_maintenance = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.quantity})"
