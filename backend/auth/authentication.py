# auth\authentication.py
# patient/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt
from rest_framework.response import Response
from rest_framework import status



path  = [
    '/login/',
    '/register/',
    '/refresh/'
]

# class JWTAuthentication(BaseAuthentication):
#     def authenticate(self, request):
#         # if request.path in path:
#         #     return None

#         if request.path.startswith("/refresh"):
#             return None
#         if request.path.startswith("/login"):
#             return None
#         if request.path.startswith("/register"):
#             return None

        
#         auth_header = request.headers.get("Authorization")

#         if not auth_header:
#             raise AuthenticationFailed("token failed")
           

#         try:
#             token = auth_header.split(" ")[1]  # Bearer <token>
#             payload = jwt.decode(
#                 token,
#                 settings.JWT_SECRET_KEY,
#                 algorithms=[settings.JWT_ALGORITHM]
#             )
            
#             print(payload)
#             return (payload, None)
#         except jwt.ExpiredSignatureError:
#             raise AuthenticationFailed("Token expired")
#         except jwt.InvalidTokenError:
#             raise AuthenticationFailed("Invalid token")

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):

        if request.path.startswith(("/login", "/register", "/refresh")):
            return None

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            raise AuthenticationFailed("No token")

        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return (payload, None)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")
