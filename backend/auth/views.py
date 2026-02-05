# auth\views.py
from django.db import connection
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from patient.serializer import patientinsertSerializer, patientupdateserializer
from rest_framework.parsers import MultiPartParser,FormParser
from django.core.files.storage import default_storage
from django.contrib.auth.hashers import make_password,check_password
import jwt
from datetime import datetime, timedelta
from django.conf import settings
import secrets
import hashlib

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.conf import settings
import uuid
import os

COOKIE_NAME = "refresh_token"

def generate_refresh_token(user):
    # return secrets.token_urlsafe(64)
    payload = {
        "user_id": user["user_id"],
        # "username": user["username"],
        # "is_active": user["is_active"],
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_LIFETIME_DAYS
        ),
        "type":"refresh",
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return token

def generate_access_token(user):
    payload = {
        "user_id": user["user_id"],
        # "username": user["username"],
        # "is_active": user["is_active"],
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_LIFETIME_MINUTES
        ),
        "type":"access",
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return token
def cookie_settings_for_request(request):
    """
    Choose cookie attributes that are safe for production and convenient for local dev.
    - In production we want secure=True and samesite='None' for cross-site cookies.
    - In development (DEBUG=True) allow secure=False and samesite='Lax' so the cookie works on http://localhost.
    """
    is_secure = (not settings.DEBUG) and request.is_secure()
    same_site = "None" if is_secure else "Lax"
    return is_secure, same_site

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def save_refresh_token(user_id, refresh_token_hash):
    """
    Persist a hashed refresh token with an expiry that matches the configured
    refresh token lifetime (in minutes).
    """
    expires_at = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_LIFETIME_DAYS
    )

    with connection.cursor() as cursor:
        cursor.execute("select storerefreshtoken(%s,%s,%s)",[user_id,refresh_token_hash,expires_at])
        row=cursor.fetchone()
        print(row)


class registerAPI(GenericAPIView):
    def get_queryset(self):
        return []
    
    def get(self,request):
        user_name=request.data.get('u_name')
        pwd=request.data.get('u_pwd')

        pwd_valid=check_password(pwd)

        with connection.cursor() as cursor:
            cursor.execute('select * from getuserauth()')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

            data = [dict(zip(columns, row)) for row in rows]
            print(data)
        return Response(data)
    
    def post(self, request):
        data = request.data

        username = data.get('u_name')
        email = data.get('u_email')
        raw_pwd = data.get('u_pwd')

        if not username or not email or not raw_pwd:
            return Response({"error": "Missing fields"}, status=400)

        pwd_hash = make_password(raw_pwd)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT createuserauth(%s, %s, %s)",
                [username, email, pwd_hash]
            )
            user_id = cursor.fetchone()[0]

        return Response({
            "message": "User registered successfully",
            "user_id": user_id
        }, status=201)
    
from rest_framework.permissions import AllowAny
from django.http import HttpRequest, HttpResponse, JsonResponse
class loginAPI(GenericAPIView):
    permission_classes=[AllowAny]
    def get_queryset(self):
        return []
    
    def post(self, request):
        username = request.data.get("u_name")
        password = request.data.get("u_pwd")
        host_domain = request.get_host().split(':')[0]

        if not username or not password:
            return Response({"error": "Missing credentials"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * from getuserauth(%s)",
                [username]
            )
            row = cursor.fetchone()
            user={
                'user_id' : row[0],
                'username' : row[1],
                'email' : row[2], 
                'is_active' : row[4],
                'is_verified':row[5],
                'created_at':row[6],
                'updated_at':row[7]

            }

        if not row:
            return Response({"error": "Invalid username "}, status=401)
        
        invalid_count =row[8]
        if (invalid_count>=3):
            return Response({"error":"your attempt got completed your account get blocked"},status=401)

        # Consistent mapping (adjust field order to match your stored procedure output)
        # I assume getuserauth returns: (user_id, username, email, password_hash, is_active)
        user_id = row[0]
        db_username = row[1]
        db_email = row[2] if len(row) > 2 else None
        db_password = row[3] if len(row) > 3 else None
        is_active = row[4] if len(row) > 4 else True
        is_verified=row[5]

        if not is_active:
            return Response({"error": "User inactive"}, status=403)
        
        if not is_verified:
            return Response({"error": "User not verified"}, status=403)

        if not db_password or not check_password(password, db_password):
            with connection.cursor() as cursor:
                cursor.execute("select countinvaliduser(%s,%s,%s)",[
                    db_username,
                    1,
                    True
                ])
                row=cursor.fetchone()
                print(row)
            return Response({"error": "Invalid password"}, status=401)
        
        with connection.cursor() as cursor:
            cursor.execute("select countinvaliduser(%s,%s,%s)",[
                db_username,
                0,
                False
            ])
            row=cursor.fetchone()
            print(row)
        # Build user payload used for JWT
        user_payload = {
            "user_id": user_id,
            # "username": db_username,
            # "is_active": is_active
        }

        access_token = generate_access_token(user_payload)
        refresh_token = generate_refresh_token(user_payload)
        hash_refresh = hash_refresh_token(refresh_token)
        save_refresh_token(user_id, hash_refresh)

        # Choose cookie attributes depending on DEBUG/HTTPS
        cookie_secure, samesite = cookie_settings_for_request(request)
        max_age = settings.REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60
        # max_age = settings.REFRESH_TOKEN_LIFETIME_MINUTES * 60
        response = JsonResponse({
            "message": "Login successful",
            "user_id": user_id,
            "username": db_username,
            "access_token": access_token,
            "user":user
        })

        # Set httpOnly refresh token cookie. In production this will be secure and samesite=None.
        response.set_cookie(
            key=COOKIE_NAME,
            value=refresh_token,
            max_age=max_age,
            httponly=True,
            secure=cookie_secure,
            samesite=samesite,
            path="/",
            domain=host_domain
        )

        return response


class logoutAPI(GenericAPIView):
    def get_queryset(self):
        return []
    
    def post(self, request: HttpRequest):
        refresh_token = request.COOKIES.get(COOKIE_NAME)
        cookie_secure, samesite = cookie_settings_for_request(request)
        host_domain = request.get_host().split(':')[0]
        # If cookie exists, delete refresh token record in DB (use hashed token)
        if refresh_token:
            try:
                hash_token = hash_refresh_token(refresh_token)
                with connection.cursor() as cursor:
                    cursor.execute("select delete_refresh_token(%s)", [hash_token])
                    _ = cursor.fetchone()
            except Exception:
                # don't leak DB errors to client; optionally log here
                pass

        # Create response that ensures cookie is removed client-side.
        response = JsonResponse({"msg": "logged out successfully"})

        # Ensure cookie is cleared — delete_cookie followed by an explicit empty cookie with max_age=0
        response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        domain=host_domain,
        samesite=samesite
    )
       
        return response
    

class profileAPI(GenericAPIView):
    def post(self, request):
        user_name=request.data.get("u_name")
        old_pwd = request.data.get("e_pwd")
        new_pwd = request.data.get("n_pwd")
        confirm_pwd = request.data.get("n_c_pwd")
        print(user_name)

        if not old_pwd or not new_pwd or not confirm_pwd:
            return Response({"error": "All fields are required"}, status=400)

        if new_pwd != confirm_pwd:
            return Response({"error": "Passwords do not match"}, status=400)

        user_id = request.user["user_id"]  # from JWTAuthentication

        with connection.cursor() as cursor:
            cursor.execute("select * from getuserauth(%s)", [user_name])
            row = cursor.fetchone()
            db_pwd=row[3]

        if not check_password(old_pwd, db_pwd):
            return Response({"error": "Old password is incorrect"}, status=401)

        new_hash = make_password(new_pwd)

        with connection.cursor() as cursor:
            cursor.execute(
                "select updateuserauth(%s,%s)",
                [new_hash, user_name]
            )
            row=cursor.fetchall()
            print(row)

        return Response({"message": "Password updated successfully"})
  
import uuid
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from django.db import connection

class EmailTokenAPI(GenericAPIView):
    def get_queryset(self):
        return []
    def post(self, request):
        user_name = request.data.get('user_name')

        if not user_name:
            return Response({"error": "Missing username"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM getuserauth(%s)", [user_name])
            row = cursor.fetchone()

        if not row:
            return Response({"error": "User not found"}, status=404)

        user_id = row[0]
        email = row[2]

        token = str(uuid.uuid4())  # ✅ generate token here

        with connection.cursor() as cursor:
            cursor.execute("SELECT email_token(%s, %s)", [ user_id,token])

        send_verification_email(email, token)

        return Response({"message": "Verification email sent"})

from django.core.mail import send_mail
from django.conf import settings

def send_verification_email(email, token):
    link = f"http://localhost:3000/verifyemail?token={token}/"

    subject = "Verify your email"
    message = f"""
Hi,

Please verify your email by clicking the link below:

{link}

This link will expire in 24 hours.

Thanks,
HPMS Team
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False
    )
from rest_framework import status

class VerifyEmailAPI(GenericAPIView):
    def get_queryset(self):
        return []
    def get(self, request, token):
        with connection.cursor() as cursor:
            cursor.execute("SELECT verify_email(%s)", [token])
            row = cursor.fetchone()

        if row and row[0] == True:
            return Response({"message": "Email verified successfully"})
        return Response({"error": "Invalid or expired token"}, status=400)


class refreshtokenAPI(GenericAPIView):
    def get_queryset(self):
        return []
    
    def post(self, request):
        print("refresh api")
        refresh_token = request.COOKIES.get(COOKIE_NAME)
        print(refresh_token)

        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=401)

        hash_token = hash_refresh_token(refresh_token)
        with connection.cursor() as cursor:
            cursor.execute("SELECT get_user_refresh_token(%s)", [hash_token])
            row = cursor.fetchone()

        if not row or not row[0]:
            return Response({"error": "Invalid or expired refresh token"}, status=401)

        # Decode and validate the refresh JWT. If it is expired or invalid,
        # return a clear 401 instead of raising an unhandled exception.
        try:
            payload = jwt.decode(
                refresh_token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            return Response({"error": "Refresh token expired"}, status=401)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid refresh token"}, status=401)
        
        print(payload)
        access_token=generate_access_token(payload)
        refresh_token=generate_refresh_token(payload)
        hash_token=hash_refresh_token(refresh_token)
        save_refresh_token(payload['user_id'], hash_token)
        cookie_secure, samesite = cookie_settings_for_request(request)
        max_age = settings.REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60
        # max_age = settings.REFRESH_TOKEN_LIFETIME_MINUTES * 60
        print("access-token:",access_token)
        print("refresh-token:",refresh_token)
        response=Response({
            "access_token":access_token
        })

         # Set httpOnly refresh token cookie. In production this will be secure and samesite=None.
        response.set_cookie(
            key=COOKIE_NAME,
            value=refresh_token,
            max_age=max_age,
            httponly=True,
            secure=cookie_secure,
            samesite=samesite,
            path="/",
        )


        return response