from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated


# Create your views here.
from .models import Staff
from .serializers import StaffSerializer
from .auth import create_token, StaffTokenAuthentication


class StaffViewSet(APIView):
    authentication_classes = [StaffTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        staff = Staff.objects.all()
        serializer = StaffSerializer(staff, many=True)
        print(serializer.data)
        return Response(serializer.data)

    def post(self, request, format=None):
        data = request.data
        print("line 23", data)
        serializer = StaffSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, pk, format=None):
        staff = Staff.objects.get(pk=pk)
        serializer = StaffSerializer(staff, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        staff = Staff.objects.get(pk=pk)
        staff.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            staff = Staff.objects.get(email=email, password=password)
        except Staff.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        token = create_token(staff)
        return Response({"token": token, "staff_id": staff.pk, "email": staff.email})
