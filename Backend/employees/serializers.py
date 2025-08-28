from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {
            'position': {'required': False},
            'hire_date': {'required': False},
            'phone': {'required': False},
            'address': {'required': False},
            'salary': {'required': False},
            'matricule': {'required': False},
            'email': {'required': False},
            'notes': {'required': False},
        }