# views.py
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.shortcuts import render, get_object_or_404
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PurchaseOrder, PurchaseOrderProduct
from .serializers import PurchaseOrderSerializer, PurchaseOrderProductSerializer


class PurchaseOrderAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            order = get_object_or_404(PurchaseOrder, pk=pk)
            serializer = PurchaseOrderSerializer(order)
            return Response(serializer.data)

        orders = PurchaseOrder.objects.all()
        serializer = PurchaseOrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PurchaseOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        order = get_object_or_404(PurchaseOrder, pk=pk)
        serializer = PurchaseOrderSerializer(order, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        order = get_object_or_404(PurchaseOrder, pk=pk)
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PurchaseOrderProductAPIView(APIView):
    def get(self, request, order_pk, pk=None):
        if pk:
            item = get_object_or_404(PurchaseOrderProduct, pk=pk, order_id=order_pk)
            serializer = PurchaseOrderProductSerializer(item)
            return Response(serializer.data)

        items = PurchaseOrderProduct.objects.filter(order_id=order_pk)
        serializer = PurchaseOrderProductSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request, order_pk):
        request.data['order'] = order_pk
        serializer = PurchaseOrderProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, order_pk, pk):
        item = get_object_or_404(PurchaseOrderProduct, pk=pk, order_id=order_pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DraftOrderCountAPIView(APIView):
    def get(self, request):
        draft_count = PurchaseOrder.objects.filter(status='CONFIRMED').count()
        return Response({"draft_orders_count": draft_count})

class MonthlySalesAPIView(APIView):
    def get(self, request):
        current_year = now().year
        last_year = current_year - 1

        # Helper to get monthly totals for a given year
        def get_monthly_totals(year):
            qs = (
                PurchaseOrder.objects.filter(payment_date__year=year, payment_date__isnull=False)
                .annotate(month=TruncMonth('payment_date'))
                .values('month')
                .annotate(total=Sum('total_ttc'))
                .order_by('month')
            )
            # Initialize 12 months with 0
            totals = [0] * 12
            for entry in qs:
                totals[entry['month'].month - 1] = float(entry['total'])
            return totals

        data = {
            "this_year": get_monthly_totals(current_year),
            "last_year": get_monthly_totals(last_year),
        }

        return Response(data)

class OrdersStatusCountAPIView(APIView):
    def get(self, request):
        qs = PurchaseOrder.objects.values('status').annotate(count=Count('id'))
        # Build a dictionary with default 0 for each status we want
        status_counts = {
            'DRAFT': 0,
            'PAID': 0,
            'CANCELLED': 0,
        }
        for entry in qs:
            status = entry['status'].upper()
            if status in status_counts:
                status_counts[status] = entry['count']
        return Response(status_counts)

class TotalProfitAPIView(APIView):
    """
    Returns the total profit of all time.
    """
    def get(self, request):
        total_profit = PurchaseOrder.objects.aggregate(total=Sum('total_ttc'))['total'] or 0
        return Response({"total_profit": float(total_profit)})