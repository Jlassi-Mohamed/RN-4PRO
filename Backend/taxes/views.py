from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import WithholdingTaxType, WithholdingTaxPayment
from .serializers import WithholdingTaxTypeSerializer, WithholdingTaxPaymentSerializer


class WithholdingTaxTypeAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            tax_type = get_object_or_404(WithholdingTaxType, pk=pk)
            serializer = WithholdingTaxTypeSerializer(tax_type)
            return Response(serializer.data)

        tax_types = WithholdingTaxType.objects.all()
        serializer = WithholdingTaxTypeSerializer(tax_types, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WithholdingTaxTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        tax_type = get_object_or_404(WithholdingTaxType, pk=pk)
        serializer = WithholdingTaxTypeSerializer(tax_type, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tax_type = get_object_or_404(WithholdingTaxType, pk=pk)
        tax_type.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WithholdingTaxPaymentAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            payment = get_object_or_404(WithholdingTaxPayment, pk=pk)
            serializer = WithholdingTaxPaymentSerializer(payment)
            return Response(serializer.data)

        payments = WithholdingTaxPayment.objects.select_related('purchase_order', 'tax_type').all()
        serializer = WithholdingTaxPaymentSerializer(payments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WithholdingTaxPaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        payment = get_object_or_404(WithholdingTaxPayment, pk=pk)
        serializer = WithholdingTaxPaymentSerializer(payment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        payment = get_object_or_404(WithholdingTaxPayment, pk=pk)
        payment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


from django.shortcuts import render

# Create your views here.
