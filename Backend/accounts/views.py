from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

# Pre-defined user credentials (you can change these)
PRE_DEFINED_USERS = {
    'admin': {'password': 'A8$!kWz7pF3qLx2', 'role': 'admin'},
    'manager': {'password': 'M9#dZp4!uV6hRq8', 'role': 'manager'},
    'stock': {'password': 'S7&nGt5^eX2bWp9', 'role': 'stock'}
}


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    # Check against pre-defined users
    if username in PRE_DEFINED_USERS and PRE_DEFINED_USERS[username]['password'] == password:
        # Get or create user in database
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'is_active': True}
        )

        if created:
            user.set_password(password)
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'username': user.username,
                'role': PRE_DEFINED_USERS[username]['role']
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    role = PRE_DEFINED_USERS.get(request.user.username, {}).get('role', 'user')
    return Response({
        'username': request.user.username,
        'role': role
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response({'message': 'Successfully logged out'})