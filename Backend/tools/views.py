from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Tool
from .serializers import ToolSerializer

class ToolAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            tool = get_object_or_404(Tool, pk=pk)
            serializer = ToolSerializer(tool)
            return Response(serializer.data)

        tools = Tool.objects.all()
        serializer = ToolSerializer(tools, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ToolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        tool = get_object_or_404(Tool, pk=pk)
        serializer = ToolSerializer(tool, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tool = get_object_or_404(Tool, pk=pk)
        tool.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
